import { AudioStoreInterface } from "../contexts/AudioAnalyzer";

export type TimingCueMode = "Event" | "Item";

export enum AudioEvent {
    GameStart = "GameStart",
    OpenMenu = "OpenMenu",
    CloseMenu = "CloseMenu",
    FoundItem = "FoundItem",
    TradeShip = "TradeShip"
}

export type EventType = "FoundItem" | "TradeShip";

export interface SoundKey {
    frequency: number;
    amplitude: number;
    negative?: boolean;
}

export type AudioFingerprint = SoundKey[];

export const GameStartFingerprint: AudioFingerprint = [
    { frequency: 4429.6875, amplitude: 175 },
    { frequency: 4781.25, amplitude: 91 },
    { frequency: 5109.375, amplitude: 216 },
    { frequency: 5812.5, amplitude: 186 },
    { frequency: 6492.1875, amplitude: 152 },
    { frequency: 7171.875, amplitude: 123 }
];

export const OpenMenuFingerprint: AudioFingerprint = [
    { frequency: 4921.875, amplitude: 199 },
    { frequency: 6000, amplitude: 169 },
    { frequency: 7101.5625, amplitude: 106 }
];

export const CloseMenuFingerprint: AudioFingerprint = [
    { frequency: 4945.3125, amplitude: 199 },
    { frequency: 5625, amplitude: 204 }
];

export const FoundItemFingerprint: AudioFingerprint = [
    { frequency: 4664.0625, amplitude: 96 },
    { frequency: 4734.375, amplitude: 117 },
    { frequency: 4805.6875, amplitude: 141 },
    { frequency: 4921.875, amplitude: 195 },
    { frequency: 5085.9375, amplitude: 140 },
    { frequency: 6000, amplitude: 168 },
    { frequency: 7101.5625, amplitude: 96 },
];

export const TradeShipFingerprint: AudioFingerprint = [
    { frequency: 4851.5625, amplitude: 197 },
    { frequency: 6070.3125, amplitude: 182 }
    /* We should probably add some tests configs like X value is > or < Y index */
];

export const FingerPrintLookup: { [key: string]: AudioFingerprint } = {
    "GameStart": GameStartFingerprint,
    "OpenMenu": OpenMenuFingerprint,
    "CloseMenu": CloseMenuFingerprint,
    "TradeShip": TradeShipFingerprint,
    "FoundItem": FoundItemFingerprint
};

export interface ItemTiming {
    event: EventType, 
    name: string, 
    timingSeconds: number,
    windowSeconds: number
}

const PEAK_MERGE_THREHOLD = 2;
const DEFAULT_WINDOW_PERIOD = 0.1;

export const ItemTimingOptionValues: ItemTiming[] = [
    { event: 'FoundItem', name: 'Wind Gem / Eye of Truth', timingSeconds: 1.55, windowSeconds: DEFAULT_WINDOW_PERIOD }, // 🔉🛑🛑🅰️
    { event: 'FoundItem', name: 'Moonberry / Seed / Con Gem', timingSeconds: 4.48, windowSeconds: DEFAULT_WINDOW_PERIOD }, // 🔉🛑🛑🛑|🛑🛑🛑🛑|🛑🛑🅰️
    { event: 'FoundItem', name: 'Idol / Hat / Berzerker Mail', timingSeconds: 6.1, windowSeconds: DEFAULT_WINDOW_PERIOD }, // 🔉🛑🛑🛑|🛑🛑🛑🛑|🛑🛑🛑🛑|🛑🛑🅰️
    { event: 'FoundItem', name: 'Pyrum / Crystalen Box', timingSeconds: 3.43, windowSeconds: DEFAULT_WINDOW_PERIOD }, // 🔉🛑🛑🛑|🛑🛑🛑🛑|🅰️
    { event: 'FoundItem', name: 'Victory Mail / Eternum Box', timingSeconds: 4.38, windowSeconds: DEFAULT_WINDOW_PERIOD }, // 🔉🛑🛑🛑|🛑🛑🛑🛑|🛑🛑🅰️
    { event: 'TradeShip', name: 'Trade 3B->4B', timingSeconds: 2.19, windowSeconds: DEFAULT_WINDOW_PERIOD }, // 🔉🛑🛑🛑|🛑🅰️
    { event: 'TradeShip', name: 'Trade 1B->4C', timingSeconds: 1.32, windowSeconds: DEFAULT_WINDOW_PERIOD },
]

export const EventTimings = [
    { event: "TradeShip", delay: 0.83, window: 0.1 },
    { event: "FoundItem", delay: 1.23, window: 0.17 },
    { event: "FoundItem", delay: 1.587, window: 0.101 },
];

export const FoundItemTimings = [
    { event: "FoundItem", type: "A", min: 1.151, max: 1.206 }, //Wind Gem / Eye of Truth
    { event: "FoundItem", type: "A", min: 4.0, max: 4.066 }, //Moonberry / Seed / Con Gem
    { event: "FoundItem", type: "A", min: 5.248, max: 5.297 }, //Ivy Band
    { event: "FoundItem", type: "A", min: 5.569, max: 5.630 } //Idol
]

export interface Peak {
    frequency: number,
    index: number,
    amplitude: number
}

export const GetFrequency = (index: number, sampleRate: number, binCount: number) => {
    return 0.5*sampleRate*(index/binCount);
}

export const FrequencyToIndex = (frequency: number, sampleRate: number, binCount: number) => {
    return Math.round(2.0*frequency*binCount/sampleRate);
}

export const FindPeaks = (data: Uint8Array, sampleRate: number,minFrequency?: number, minAmplitude?: number) => {
    const peaks: Peak[] = [];

    let startIndex = minFrequency ? FrequencyToIndex(minFrequency,sampleRate,data.length) : 1;
    if(startIndex < 1) {
        startIndex = 1;
    }

    for(let i = startIndex;i < data.length-1;i++) {
        const current = data[i];
        const previous = data[i-1];
        const next = data[i+1];

        if((minAmplitude && current < minAmplitude) 
        || current <= previous
        || current <= next) {
            continue;
        }

        const lastPeak = peaks[peaks.length - 1];
        if(lastPeak && (i - lastPeak.index) < PEAK_MERGE_THREHOLD) {
            if(lastPeak.amplitude > current) {
                continue;
            } else {
                peaks.pop();
            }
        }

        peaks.push({ frequency: GetFrequency(i,sampleRate,data.length), index: i, amplitude: current });
    }
    return peaks;
}

export const FindClosest = (peaks: Peak[],targetFrequency: number,tolerance: number) => {
    let bestDiff: number = Infinity;
    let bestPeak: Peak|null = null;
    for(const peak of peaks) {
        const diff = Math.abs(targetFrequency - peak.frequency);
        if(diff < tolerance && (bestPeak === null || bestDiff > diff)) {
            bestPeak = peak;
            bestDiff = diff;   
        }
    }

    return bestPeak;
}


export const DetectFingerprint = (fingerprint: AudioFingerprint, peaks: Peak[],audio: AudioStoreInterface) => {
    if(!audio.dataArray || audio.dataArray.length === 0 || peaks.length === 0 || fingerprint.length === 0) {
        return false;
    }

    let maxPeakAmplitude = -Infinity;
    let maxKeyAmplitude = -Infinity;
    const matches = [];
    const tolerance = 2*audio.sampleRate()/audio.dataArray.length;

    for(const key of fingerprint) {
        const bestPeak = FindClosest(peaks,key.frequency,tolerance);
        if(bestPeak === null) {
            return false;
        }

        if(bestPeak.amplitude > maxPeakAmplitude) {
            maxPeakAmplitude = bestPeak.amplitude;
        }

        if(key.amplitude > maxKeyAmplitude) {
            maxKeyAmplitude = key.amplitude;
        }

        matches.push(bestPeak);
    }

    //Is there a larger peak between any of our expected peaks if so we will ignore this
    
    // let nextMatchIdx = 0;
    // for(const peak of peaks) {

    //     const nextKey = matches[nextMatchIdx];
    //     if(nextMatchIdx === 0 && peak.frequency < nextKey.frequency) {
    //         continue;
    //     }

    //     if(nextKey.frequency === peak.frequency) {
    //         nextMatchIdx += 1;
    //         if(nextMatchIdx === matches.length) {
    //             break;
    //         }
    //         continue;
    //     }

    //     if(nextKey.amplitude < peak.amplitude) {
    //         return false;
    //     }
    // }

    //We should test the amplitudes vs the average background noise within the band filter

    //We check if the frequencies found approximately match the expected amplitude ratios
    if(matches.length !== fingerprint.length) {
        console.error("Matches should match fingerprint length!");
        return false;
    }

    for(let i = 0;i < matches.length;i++) {
        const matchPeak = (matches[i] as SoundKey).amplitude / maxPeakAmplitude;
        const keyPeak = fingerprint[i].amplitude / maxKeyAmplitude;

        if(Math.abs(keyPeak - matchPeak) > 0.25) {
            return false;
        }
    }

    return true;
}