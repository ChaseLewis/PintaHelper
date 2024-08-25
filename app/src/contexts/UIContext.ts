import { create } from 'zustand';
import { ItemTiming } from '../utils/Loot';

export interface UIInterface {
    selectedArea: number,
    selectedItem: ItemTiming|null,
    update: (method: (state: UIInterface) => UIInterface) => void,
    updateSelectedArea: (area: number) => void
}

// const persistToUri = (state: UIInterface) => {
//     const searchParams = new URLSearchParams();
//     if(state.selectedArea)
//     {
//         searchParams.append("area",state.selectedArea.toString());
//     }
    
//     if(state.selectedItem) {
//         searchParams.append("item",state.selectedItem.item);
//     }

//     location.search = searchParams.toString();
// }

export const useUIStore = create<UIInterface>((set) => ({
   selectedArea: parseInt(localStorage.getItem("pinta-selected-area") || "22"),
   selectedItem: null,
   update: (method: (state: UIInterface) => UIInterface) => {
    set((state) => {
        return method(state);
    });
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

