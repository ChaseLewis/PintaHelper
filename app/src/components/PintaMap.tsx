import React, { useMemo } from 'react';
import pintaMapImageUrl from '../assets/img/PintasQuestMap.webp';
import pintaNumberedImageUrl from '../assets/img/PintasQuestNumberedMap.webp';
import { useUIStore } from '../contexts/UIContext';
import { DEFAULT_ITEM_MAP } from '../utils/Loot';

export interface PintaMapProps {
    displayNumber?: boolean
}

export const PintaMap = (props: PintaMapProps) => {

    const uiStore = useUIStore();

    const pintaMapImageStyle = {
        display: props.displayNumber ? "none" : undefined
    };

    const pintaNumberedMapImageStyle = {
        display: props.displayNumber ? undefined : "none"
    };

    const onClick = (e: React.MouseEvent<HTMLImageElement>) => {
        const img = e.target as HTMLImageElement;
        const w = img.clientWidth;
        const h = img.clientHeight;
        
        const boxXDim = 1.0/7.0;
        const boxYDim = 1.0/6.0;
        const normX = e.nativeEvent.offsetX/w;
        const normY = 1.0 - e.nativeEvent.offsetY/h;
        const boxX = Math.floor(normX/boxXDim);
        const boxY = Math.floor(normY/boxYDim);
        const boxID = boxX*6 + boxY + 1;

        uiStore.updateSelectedArea(boxID);
    }

    const unmappedAreas = useMemo(() => {

        const unmappedAreaDivs = [];
        for(let i = 1;i <= 42;i++) {
            if(DEFAULT_ITEM_MAP[i]) {
                continue;
            }

            const index = i - 1;
            const X = Math.floor(index / 6);
            const Y = 5 - Math.max(index - X*6,0);

            unmappedAreaDivs.push(<div
                key={`pinta-mask-${i}`}
                style={{ 
                    background: "rgba(20,20,20,0.7)", 
                    width: "calc(100% / 7)", 
                    height: "calc(100% / 6)", 
                    position: "absolute", 
                    left: `calc( ${X} * 100% / 7)`, 
                    top: `calc(${Y} * 100% / 6 - ${Y}px)` 
                }}
            />) as React.CSSProperties;
        }

        return unmappedAreaDivs;
    },[]);

    const highlightStyle = useMemo(() => {
        const index = uiStore.selectedArea - 1;
        const X = Math.floor(index / 6);
        const Y = 5 - Math.max(index - X*6,0);

        return { 
            outline: "3px solid red", 
            width: "calc(100% / 7 - 3px)", 
            height: "calc(100% / 6 - 4px)", 
            position: "absolute", 
            left: `calc( ${X} * 100% / 7)`, 
            top: `calc(${Y} * 100% / 6 - ${Y-1}px + 1px)` 
        } as React.CSSProperties;
    },[uiStore.selectedArea]);

    return (
    <div className="map-row">
        <div style={{ position: "relative" }}>
            <img src={pintaMapImageUrl} title="Pinta Quest Map" style={pintaMapImageStyle} onClick={onClick} />
            <img src={pintaNumberedImageUrl} title="Pinta Quest Map With Numbers" style={pintaNumberedMapImageStyle} onClick={onClick} />
            {unmappedAreas}
            <div style={highlightStyle}/>   
        </div>
    </div>
    );
}