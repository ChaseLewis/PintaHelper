import { create } from 'zustand';

const audioContext = new AudioContext();
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

export interface AudioStoreInterface {
    running: boolean,
    context: AudioContext,
    stream: MediaStream|null,
    source: MediaStreamAudioSourceNode|null,
    analyzer: AnalyserNode|null,
    dataArray: Uint8Array|null,
    minFrequency: number,
    minAmplitude: number,
    sampleRate(): number,
    start(): Promise<void>,
    stop(): Promise<void>
}

export const useAudioStore = create<AudioStoreInterface>((set) => ({
    running: false,
    context: audioContext,
    stream: null,
    source: null,
    analyzer: null,
    dataArray: null,
    minFrequency: 4000,
    maxFrequency: 10000,
    minAmplitude: 70,
    sampleRate: function () {
        return this.context?.sampleRate ?? 48000;
    },
    start: async function () {
        if(this.running) {
            return;
        }

        try {
            await this.context.resume();
        } catch {
            /* We ignore this error */
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = this.context.createMediaStreamSource(stream);
        const analyzer = this.context.createAnalyser();
        analyzer.fftSize = 2048;
        source.connect(analyzer);

        set((state) => {
            return { ...state, 
                running: true,
                stream, 
                source,
                analyzer,
                dataArray: new Uint8Array(analyzer.frequencyBinCount)
            };
        });
    },
    stop: async function () {
        if(!this.running) {
            return;
        }

        try {
            await this.context.suspend();
        } catch {
            /* We explicitly ignore errors */
        }

        set((state) => {
            return {
                ...state,
                running: false,
                dataArray: null,
                analyzer: null,
                source: null,
                stream: null
            }
        });
    }
}));