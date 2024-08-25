import { useRef, useEffect, CSSProperties, useMemo } from 'react';
import { AudioStoreInterface, useAudioStore } from '../contexts/AudioAnalyzer';
import { AudioEvent, DetectFingerprint, FindPeaks, FingerPrintLookup, FrequencyToIndex, Peak } from '../utils/Timing';
import { StateMachineInterface, useStateMachineStore } from '../contexts/StateMachineContext';

export interface FrequencyVisualizerProps {

    width: number,
    height: number,
    className?: string,
    style?: CSSProperties
}

const DrawThresholds = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, audio: AudioStoreInterface, hipassThreshold: number,amplitudeThreshold: number) => {

    if(!audio.dataArray) {
        return;
    }

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const sliceWidth = canvasWidth / audio.dataArray.length;

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgb(0,0,200)";
    const hiPassX = sliceWidth*FrequencyToIndex(hipassThreshold,audio.sampleRate(),audio.dataArray.length);
    ctx.beginPath();
    ctx.moveTo(hiPassX,0);
    ctx.lineTo(hiPassX,canvasHeight)
    ctx.stroke();

    const ampY = canvasHeight - canvasHeight*(amplitudeThreshold/255.0);
    ctx.strokeStyle = "rgb(200,200,0)";
    ctx.beginPath();
    ctx.moveTo(0,ampY);
    ctx.lineTo(canvasWidth,ampY);
    ctx.stroke();
}

const DrawFrequencyGraph = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D,data: Uint8Array,peaks: Peak[]) => {
    
    //Clear the canvas
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    ctx.fillStyle = "rgb(180,180,180)";
    ctx.fillRect(0,0,canvasWidth,canvasHeight);

    //Draw our frequency graph
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgb(0,0,0)";

    ctx.beginPath();
    let x = 0;
    const sliceWidth = canvasWidth / data.length;
    for(let i = 0;i < data.length;i++) {
        const v = (data[i] / 255.0);
        const y = canvasHeight - v*canvasHeight; 
        if(i === 0) {
            ctx.moveTo(x,y);
        } else {
            ctx.lineTo(x,y);
        }
        x += sliceWidth;
    }
    ctx.stroke();

    for(const peak of peaks) {
        const x = peak.index * sliceWidth;
        const v = peak.amplitude / 128.0;
        const y = canvasHeight - (v * canvasHeight / 2);

        const size = 5;
        ctx.fillStyle = "rgb(255,0,0)";
        ctx.beginPath();
        ctx.moveTo(x-size, y-size);
        ctx.lineTo(x+size, y-size);
        ctx.lineTo(x, y);
        ctx.fill();        
    }
}

const TestFingerprints = (peaks: Peak[],audio: AudioStoreInterface) => {
    for(const key in FingerPrintLookup) {
            const fingerprint = FingerPrintLookup[key];
            if(DetectFingerprint(fingerprint,peaks,audio)) {
                return key as AudioEvent;
            }
    }

    return null;
}

const FindMaxAmplitude = (peaks: Peak[]): number => {
    let maxAmplitude = -Infinity;
    for(const peak of peaks) {
        maxAmplitude = Math.max(maxAmplitude,peak.amplitude);
    }
    return maxAmplitude;
}

const HandleMaxRecording = (previousPeaks: Peak[]|null,currentPeaks: Peak[],state: StateMachineInterface): Peak[]|null => {
    if(state.recordMax) {
        if(previousPeaks === null) {
            return currentPeaks;
        }

        const maxPrevAmplitude = FindMaxAmplitude(previousPeaks);
        const maxCurrentAmplitude = FindMaxAmplitude(currentPeaks);

        return maxPrevAmplitude >= maxCurrentAmplitude ? previousPeaks : currentPeaks;
    }

    if(previousPeaks) {
        console.log(previousPeaks);
    }

    return null;
}

export const FrequencyVisualizer = (props: FrequencyVisualizerProps) => {
    const audioStore = useAudioStore();
    const stateStore = useStateMachineStore();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const refValues = useRef({ 
        animRef: -1,
        state: stateStore,
        audio: audioStore
    });

    //Anytime there is an update we want to update the refs
    refValues.current.audio = audioStore;
    refValues.current.state = stateStore;

    //We configure a requestAnimationFrame callback to handle
    //rendering to the canvas & processing various data we use
    //for signal processing
    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');

        let recordingPeaks: Peak[]|null = null;
        const handleAnimation = () => {
            
            const audio = refValues.current.audio;
            const state = refValues.current.state;
            refValues.current.animRef = requestAnimationFrame(handleAnimation);
            if(!audio.running
            || !audio.context
            || !audio.analyzer
            || !audio.dataArray
            ) {
                return;
            }

            audio.analyzer.getByteFrequencyData(audio.dataArray);
            const peaks = FindPeaks(audio.dataArray,audio.sampleRate(),audio.minFrequency,audio.minAmplitude);
            recordingPeaks = HandleMaxRecording(recordingPeaks,peaks,state);
            const fingerprintMatch = TestFingerprints(peaks,audio);
            state.transition(fingerprintMatch);
            //If recording -> we should hold the peak list with the largest amplitude until recording is disabled

            if(canvasRef.current && state.debug && ctx) {
                DrawFrequencyGraph(canvasRef.current,ctx,audio.dataArray,peaks);
                DrawThresholds(canvasRef.current,ctx,audio,audio.minFrequency,audio.minAmplitude);
            }
        };

        refValues.current.animRef = requestAnimationFrame(handleAnimation);

        return () => { 
            cancelAnimationFrame(refValues.current.animRef);
        };

    },[stateStore.debug]);

    const canvasStyle = useMemo(() => {
        let initialStyle: CSSProperties = { outline: "1px solid var(--pintaBlue)" };
        if(props.style) {
            initialStyle = { ...initialStyle, ...props.style };
        }

        return initialStyle;
    },[props.style]);

    return (
        <>
            {stateStore.debug && <canvas ref={canvasRef} className={props.className} width={props.width} height={props.height} style={canvasStyle}></canvas>}
        </>
    );
}