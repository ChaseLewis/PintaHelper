
export type EventType = "FoundItem" | "TradeShip";
export type ItemType = "A" | "B" | "C" | null;
export type ItemName = "Test" | "Electri Box" | "Pyri Box" | "Wevles Box" 
| "Icyl Seed" | "Magus Seed" | "Vidal Seed"
| "Moonberry" 
| "Revered Voice" | "Wind Gem Ring" | "Eye of Truth" | "Ivy Band"
| "Magillex Idol" 
| "3B->4B";

export interface ItemTiming {
    event: EventType,
    type: ItemType,
    item: ItemName,
    min: number,
    max: number
}

export interface EventTiming {
    label: string,
    min: number,
    max: number
}

export const DEFAULT_EVENT_MAP: { [key: string]: EventTiming } = {
    "FoundItem": { label: "Found", min: 1.587, max: 1.687 },
    "TradeShip": { label: "Trade", min: 1.821, max: 1.921 }
};

export const DEFAULT_ITEM_MAP: { [key: number]: ItemTiming[] }= {
    14: [ 
        { event: "FoundItem", type: "A", item: "Magillex Idol", min: 5.569, max: 5.630 }
    ],
    22: [
        { event: "FoundItem", type: "A", item: "Icyl Seed", min: 4.0, max: 4.066 },
        { event: "FoundItem", type: "A", item: "Wind Gem Ring", min: 5.232, max: 5.297 }
    ]
}


// export const DEFAULT_ITEM_MAP: { [key: number]: ItemTiming[] }= {
//     14: [ 
//         { event: "TradeShip", type: null, item: "3B->4B", min: 1, max: 1.1 },
//         { event: "FoundItem", type: "A", item: "Magillex Idol", min: 5.534, max: 5.630 },
//         { event: "FoundItem", type: "A", item: "Eye of Truth", min: 1.150, max: 1.206 },
//         { event: "FoundItem", type: "A", item: "Moonberry", min: 3.988, max: 4.066 }
//     ],
//     //Need to double check this
//     15: [
//         { event: "TradeShip", type: null, item: "3B->4B", min: 2.35, max: 2.45 },   
//         { event: "FoundItem", type: "B", item: "Pyri Box", min: 3.1, max: 3.2}, /* Unverified */
//         { event: "FoundItem", type: "B", item: "Wevles Box", min: 3.200, max: 3.28 }, /* Unverified */
//         //{ event: "FoundItem", type: "B", item: "B Items", }
//         { event: "FoundItem", type: "A", item: "Ivy Band", min: 1.151, max: 1.216 },
//         { event: "FoundItem", type: "A", item: "Vidal Seed", min: 3.988, max: 4.066 },
//         { event: "FoundItem", type: "A", item: "Moonberry", min: 5.530, max: 5.63 }, 
//     ],
//     20: [
//         { event: "TradeShip", type: null, item: "3B->4B", min: 2.35, max: 2.45 }, /* Don't think this is useful */
//         { event: "FoundItem", type: "A", item: "Eye of Truth", min: 1.151, max: 1.206 },
//         // { event: "FoundItem", type: "A", item: "Icyl Seed", min: 3.988, max: 4.066 }, //This is the same as the next window but smaller window
//         { event: "FoundItem", type: "A", item: "Icyl Seed", min: 5.516, max: 5.616 }, 
//     ],
//     22: [
//         { event: "TradeShip", type: null, item: "3B->4B", min: 2.35, max: 2.45 },
//         { event: "FoundItem", type: "B", item: "Pyri Box", min: 2.91, max: 2.97},
//         { event: "FoundItem", type: "B", item: "Wevles Box", min: 3.03, max: 3.096 },
//         { event: "FoundItem", type: "A", item: "Eye of Truth", min: 1.151, max: 1.206 },
//         { event: "FoundItem", type: "A", item: "Icyl Seed", min: 3.988, max: 4.066 },
//         { event: "FoundItem", type: "A", item: "Moonberry", min: 5.516, max: 5.616 },
//     ],
//     28: [
//         { event: "TradeShip", type: null, item: "3B->4B", min: 2.35, max: 2.45 },
//         { event: "FoundItem", type: "B", item: "Pyri Box", min: 2.95, max: 3.018},
//         { event: "FoundItem", type: "B", item: "Wevles Box", min: 3.200, max: 3.28 },
//         { event: "FoundItem", type: "A", item: "Revered Voice", min: 1.151, max: 1.216 },
//         { event: "FoundItem", type: "A", item: "Magus Seed", min: 3.988, max: 4.066 },
//         { event: "FoundItem", type: "A", item: "Moonberry", min: 5.524, max: 5.624 }, //Moonberry (this one is weird I've hit it over 128ms which is waaay higher than most)
//     ]
// }