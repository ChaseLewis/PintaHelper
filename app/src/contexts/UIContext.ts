import { create } from 'zustand';
import {  DEFAULT_ITEM_MAP, ItemTiming } from '../utils/Loot';

export interface UIInterface {
    selectedArea: number,
    selectedItem: ItemTiming|null,
    update: (method: (state: UIInterface) => UIInterface) => void,
    getLastSelectedItem: (area: number) => ItemTiming|null,
    updateSelectedArea: (area: number) => void,
    updatedSelectedItem: (itemName: string) => void
}

export const findItemInArea = (items: ItemTiming[],name: string|null) => {
    if(!name || !Array.isArray(items)) {
        return null;
    }

    for(const item of items) {
        if(item.item === name) {
            return item;
        }
    }

    return null;
}

export type SelectedItemHistory = Record<number,string>;

const loadInitialHistory = (): SelectedItemHistory => {
    const history = localStorage.getItem("pinta-selected-item-history");
    if(history) {
        return JSON.parse(history);
    }

    return {};
}

let SELECTED_ITEM_HISTORY = loadInitialHistory();

export const useUIStore = create<UIInterface>((set) => ({
   selectedArea: parseInt(localStorage.getItem("pinta-selected-area") || "22"),
   selectedItem: null,
   update: (method: (state: UIInterface) => UIInterface) => {
    set((state) => {
        return method(state);
    });
   },
   getLastSelectedItem: (area: number) => {
        const name = SELECTED_ITEM_HISTORY[area];
        const itemMap = DEFAULT_ITEM_MAP[area];
        if(!name || !itemMap) {
            return null;
        }

        for(const item of itemMap) {
            if(item.item === name) {
                return item;
            }
        }
        return null;
   },
   updatedSelectedItem: function (itemName: string) {
    if(!itemName) {
        return;
    }

    let foundItem = null;
    const items = DEFAULT_ITEM_MAP[this.selectedArea];
    for(const item of items) {
        if(item.item === itemName) {
            SELECTED_ITEM_HISTORY[this.selectedArea] = item.item;
            localStorage.setItem("pinta-selected-item-history",JSON.stringify(SELECTED_ITEM_HISTORY));
            foundItem = item;
            break;
        }
    }

    if(!foundItem) {
        return;
    }

    set((state) => {
        return { ...state, selectedItem: foundItem };
    })
   },
   updateSelectedArea: (area: number) => {
        if(isNaN(area) || area < 1 || area > 42) {
            return;
        }

        const roundedArea = Math.round(area);
        localStorage.setItem("pinta-selected-area",roundedArea.toString());
        set((state) => {
            return { ...state, selectedArea: roundedArea };
        })
   }
}));

