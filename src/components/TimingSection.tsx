import { PintaState } from "../contexts/StateMachineContext";
import { useUIStore } from "../contexts/UIContext";
import { TimingBar } from "./TimingBar";
import { DEFAULT_EVENT_MAP } from "../utils/Loot";


/*
        <div className="timing-row">
            <TimingBar activeState={PintaState.MenuOpen} duration={1.587} window={0.1} />
            <TimingBar title="Event: Trade Ship" activeState={PintaState.MenuOpen} duration={1.85} window={0.1} />
            <TimingBar activeState={PintaState.EventInProgress} duration={3} window={0.1} />
            <TimingBar title="Trade: 3B->4B" activeState={PintaState.EventInProgress} duration={2.4} window={0.1} />
        </div>      
*/
export const TimingSection = () => {
    const uiStore = useUIStore();


    const event = uiStore.selectedItem && DEFAULT_EVENT_MAP[uiStore.selectedItem.event];


    return (
        <div className="timing-row">
            {uiStore.selectedItem && event && (
                <>
                <TimingBar title={event.label} activeState={PintaState.MenuOpen} duration={event.min} window={event.max - event.min} />
                <TimingBar title={uiStore.selectedItem.item} activeState={PintaState.EventInProgress} duration={uiStore.selectedItem.min} window={uiStore.selectedItem.max - uiStore.selectedItem.min} />
                </>
            )}
        </div>    
    );
}