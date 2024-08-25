import React, { useMemo } from 'react';
import pintaMapImageUrl from '../assets/img/PintasQuestMap.webp';
import pintaNumberedImageUrl from '../assets/img/PintasQuestNumberedMap.webp';
import { useUIStore } from '../contexts/UIContext';

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

    const highlightStyle = useMemo(() => {
        const index = uiStore.selectedArea - 1;
        const X = Math.floor(index / 6);
        const Y = 5 - Math.max(index - X*6,0);

        return { 
            outline: "2px solid red", 
            width: "calc(100% / 7 - 3px)", 
            height: "calc(100% / 6 - 3px)", 
            position: "absolute", 
            left: `calc( ${X} * 100% / 7 + ${1}px)`, 
            top: `calc(${Y} * 100% / 6 - ${Y-1}px + 1px)` 
        } as React.CSSProperties;
    },[uiStore.selectedArea]);

    return (
    <div className="map-row">
        <div style={{ position: "relative" }}>
            <img src={pintaMapImageUrl} title="Pinta Quest Map" style={pintaMapImageStyle} onClick={onClick} />
            <img src={pintaNumberedImageUrl} title="Pinta Quest Map With Numbers" style={pintaNumberedMapImageStyle} onClick={onClick} />
            <div style={highlightStyle}/>   
        </div>
    </div>
    );
}