import { CSSProperties, useEffect, useMemo, useRef } from "react";
import { useStateMachineStore, StateMachineInterface, PintaState } from '../contexts/StateMachineContext';
import { AudioEvent } from "../utils/Timing";

export interface TimingBarProps {
    title: string,
    duration: number;
    window: number;
    activeState: PintaState,
    style?: CSSProperties
}

const EXTRA_TIME = 0.25;
const PADDING = 2;

const DrawTimingBar = (
    canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, store: StateMachineInterface,
    duration: number, window: number, timeInState: number
) => {


    ctx.clearRect(0,0,canvas.width,canvas.height);

    const windowLength = window*store.pixelsPerSecond
    const durationLength = store.pixelsPerSecond*(duration + store.drift);
    const extraLength = EXTRA_TIME*store.pixelsPerSecond;
    const fillLength = Math.min(Math.round(timeInState*store.pixelsPerSecond),durationLength+windowLength+extraLength+store.drift);
    const totalLength = durationLength + windowLength + extraLength;
    //We need to find a way to shorten the timer by about 300 pixels
    // console.log({
    //     windowLength,
    //     durationLength,
    //     extraLength,
    //     drift: store.drift
    // })
    ctx.fillStyle = "rgb(180,180,180)";
    ctx.fillRect(0,PADDING,totalLength,canvas.height-2*PADDING);
    //ctx.fillRect(durationLength+windowLength,PADDING,extraLength,canvas.height-2*PADDING);

    ctx.fillStyle = "#00FF00";
    ctx.fillRect(durationLength,0,windowLength,canvas.height);

    ctx.fillStyle = "#f8b503";
    ctx.fillRect(0,PADDING,fillLength,canvas.height-2*PADDING);

    //Draw the beat markers
    const inactiveMarkerColor = "rgb(255,255,255)";
    const activeMarkerColor = "rgb(255,0,0)";
    const beatLength = (60.0/store.beat)*store.pixelsPerSecond;
    let anticipationX = Math.round(durationLength - store.anticipation*store.pixelsPerSecond + 0.033*store.pixelsPerSecond);
    ctx.lineWidth = 1;
    while(anticipationX > 0)
    {
        ctx.strokeStyle = anticipationX <= fillLength ? activeMarkerColor : inactiveMarkerColor;
        ctx.beginPath();
        ctx.moveTo(anticipationX,PADDING);
        ctx.lineTo(anticipationX,canvas.height-PADDING);
        ctx.stroke();
        anticipationX -= beatLength;
    }
}

export const TimingBar = (props: TimingBarProps) => {

    const stateStore = useStateMachineStore();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const refValues = useRef({ 
        animRef: -1, 
        stateStore, 
        duration: props.duration,
        window: props.window,
        activeState: props.activeState
    });

    refValues.current.stateStore = stateStore;
    refValues.current.duration = props.duration;
    refValues.current.window = props.window;
    refValues.current.activeState = props.activeState;

    useEffect(() => {
        if(!canvasRef.current) {
            console.error("Canvas ref shold be initialized");
            return;
        }

        const ctx = canvasRef.current.getContext('2d');

        if(!ctx) {
            console.error("CanvasRenderingContext2D should not be null");
            return;
        }

        const handleAnimation = () => {
            refValues.current.animRef = requestAnimationFrame(handleAnimation);
            if(!canvasRef.current) {
                return;
            }

            const state = refValues.current.stateStore;
            const duration = refValues.current.duration;
            const window = refValues.current.window;
            const activeState = refValues.current.activeState;

            const stateInfo = state.stateInfo.get(activeState);
            let timeInState = 0;

            if(stateInfo) {
                if(stateInfo.endTimestamp >= stateInfo.startedTimestamp) {
                    timeInState = (stateInfo.endTimestamp - stateInfo.startedTimestamp)/1000.0;
                } else {
                    timeInState = (performance.now() - stateInfo.startedTimestamp)/1000.0;
                    // We should auto transition here so the user doesn't get screwed if the audio fails to get picked up properly
                    // if(timeInState >= (duration + window + EXTRA_TIME)) {
                    //     switch(activeState)
                    //     {
                    //         case PintaState.MenuOpen:
                    //             stateStore.transition(AudioEvent.CloseMenu);
                    //             break;
                    //         case PintaState.EventInProgress:
                    //             stateStore.transition(AudioEvent.OpenMenu);
                    //             break;
                    //         case PintaState.TradeInProgress:
                    //             stateStore.transition(AudioEvent.OpenMenu);
                    //             break;
                    //     }
                    // }
                }
            }

            DrawTimingBar(canvasRef.current,ctx,state,duration,window,timeInState);
        };

        refValues.current.animRef = requestAnimationFrame(handleAnimation);

        return () => { 
            cancelAnimationFrame(refValues.current.animRef);
        };                                        
    },[]);

    const canvasWidth = useMemo(() => {
        return stateStore.pixelsPerSecond*(props.duration + props.window + EXTRA_TIME + stateStore.drift);
    },[props.duration,stateStore.pixelsPerSecond,stateStore.drift]);

    const canvasStyle = useMemo(() => {
        
        let initStyle: CSSProperties = { height: '26px', width: canvasWidth };
        if(props.style) {
            initStyle = { ...initStyle, ...props.style };
        }

        return initStyle;
    },[props.style,canvasWidth]);

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <div>{props.title}</div>
            <canvas ref={canvasRef} width={canvasWidth} height={26} style={canvasStyle}></canvas>
        </div>
    );
}