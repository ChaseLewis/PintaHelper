import { useEffect, useMemo } from "react";
import { useUIStore } from "../contexts/UIContext"
import { Select } from "antd";
import { DEFAULT_ITEM_MAP } from "../utils/Loot";

export const LootSelector = () => {

    const uiStore = useUIStore();

    const [options,items,trades] = useMemo(() => {

        const lootMap = DEFAULT_ITEM_MAP[uiStore.selectedArea]
        
        if(!lootMap) {
            return [[],[],[]];
        }

        const items = lootMap.filter((x) => x.event === "FoundItem");
        const trades = lootMap.filter((x) => x.event === "TradeShip");

        const options: any[] = [];
        if(items.length > 0)
        {
            options.push({
            label: <span>Found</span>,
            title: "Found",
            options: items.map((x) => {
                    return {
                        data: x,
                        label: x.item,
                        value: x.item
                    };
                })
            });
        }

        if(trades.length > 0) {
            options.push({
                label: <span>Trades</span>,
                title: "Trades",
                options: trades.map((x) => {
                        return {
                            data: x,
                            label: x.item,
                            value: x.item
                        };
                    })
                });
        }

        return [options,items,trades];
    },[uiStore.selectedArea]);

    useEffect(() => {
        if(items.length === 0 && trades.length === 0) {
            uiStore.update((state) => {
                return { ...state, selectedItem: null };
            });
            return;
        }

        const lastItem = uiStore.getLastSelectedItem(uiStore.selectedArea);
        if(lastItem) {
            uiStore.update((state) => {
                return {...state, selectedItem: lastItem };
            });
            return;
        }
        if(items.length > 0) {
            uiStore.update((state) => {
                return {...state, selectedItem: items[0] };
            });
            return;
        }

        if(trades.length > 0) {
            uiStore.update((state) => {
                return {...state,selectedItem: trades[0] };
            });
            return;
        }

    },[items,trades])

    return (
        <Select
            value={uiStore.selectedItem?.item}
            onChange={(v,o) => {
                console.log({ v, o });
                uiStore.updatedSelectedItem(o.value);
            }}
            options={options}
            style={{ width: "100%"}}
        />
    );
}