import { create } from 'zustand';
import { ItemTiming } from '../utils/Loot';

export interface UIInterface {
    selectedArea: number,
    selectedItem: ItemTiming|null,
    update: (method: (state: UIInterface) => UIInterface) => void
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
   selectedArea: 22,
   selectedItem: null,
   update: (method: (state: UIInterface) => UIInterface) => {
    set((state) => {
        return method(state);
    });
   }
}));

