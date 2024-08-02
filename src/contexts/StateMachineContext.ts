import { create, State } from 'zustand';
import { AudioEvent } from '../utils/Timing';

export enum PintaState {
    WaitingForMenu = "WaitingForMenu",
    MenuOpen = "MenuOpen",
    WaitingForEvent = "WaitingForEvent",
    EventInProgress = "EventInProgress",
    TradeInProgress = "TradeInProgress",
    Complete = "Complete"
}

export interface StateInfo {
    state: PintaState,
    startedTimestamp: number,
    endTimestamp: number
}

export interface StateMachineInterface {
    debug: boolean,
    recordMax: boolean,
    beat: number,
    pixelsPerSecond: number,
    drift: number,
    anticipation: number,
    currentState: PintaState,
    stateInfo: Map<PintaState,StateInfo>,
    transition: (event: AudioEvent|null) => void,
    update: (method: (state: StateMachineInterface) => StateMachineInterface) => void
}

export const useStateMachineStore = create<StateMachineInterface>((set) => ({
    debug: false,
    recordMax: false,
    beat: 138,
    pixelsPerSecond: 82,
    anticipation: .125,
    drift: 0,
    stateInfo: new Map<PintaState,StateInfo>([
        [PintaState.WaitingForMenu, { state: PintaState.WaitingForMenu, startedTimestamp: -1.0, endTimestamp: -1.0 }],
        [PintaState.MenuOpen, { state: PintaState.MenuOpen, startedTimestamp: -1.0, endTimestamp: -1.0 }],
        [PintaState.WaitingForEvent, { state: PintaState.WaitingForEvent, startedTimestamp: -1.0, endTimestamp: -1.0 }],
        [PintaState.EventInProgress, { state: PintaState.EventInProgress, startedTimestamp: -1.0, endTimestamp: -1.0 }],
        [PintaState.Complete, { state: PintaState.Complete, startedTimestamp: -1.0, endTimestamp: -1.0 }]
    ]),
    currentState: PintaState.WaitingForMenu,
    update: (method: (state: StateMachineInterface) => StateMachineInterface) => {
        set(method);
    },
    transition: function(event: AudioEvent|null) {
        if(!event) {
            return;
        }

        let newState: PintaState|null = null;
        switch(event) {
            case AudioEvent.GameStart:
                newState = PintaState.WaitingForMenu;
                break;
            case AudioEvent.OpenMenu: //Open Menu sound is used for Opening the Menu & Found Item
                switch(this.currentState) {
                    case PintaState.WaitingForMenu:
                        newState = PintaState.MenuOpen;
                        break;
                    case PintaState.WaitingForEvent:
                        newState = PintaState.EventInProgress;
                        break;
                    case PintaState.EventInProgress:
                        newState = PintaState.Complete;
                        break;
                    case PintaState.Complete:
                        newState = PintaState.EventInProgress;
                        break;
                    default:
                        break;
                }
                break;
            case AudioEvent.TradeShip:
                switch(this.currentState) {
                    case PintaState.WaitingForEvent:
                        newState = PintaState.EventInProgress;
                        break;
                    case PintaState.Complete:
                        newState = PintaState.EventInProgress;
                        break;
                    default:
                        break;
                }
                break;
            case AudioEvent.CloseMenu:
                if(this.currentState === PintaState.MenuOpen) {
                    newState = PintaState.WaitingForEvent;
                }
                break;
            default:
                return;
        }

        if(newState && newState !== this.currentState) {

            const newTransitionTime = performance.now();
            const oldStateInfo  = this.stateInfo.get(this.currentState) as StateInfo;
            if(oldStateInfo.startedTimestamp > 0 && Math.abs(newTransitionTime - oldStateInfo.startedTimestamp) <= 250) {
                //We ignore state transitions that occur to quickly
                //console.log(`Ignored ${newTransitionTime-oldStateInfo.startedTimestamp}`)
                return;
            }
            //If the transition time is < 0.25 seconds or so we likely should ignore the transition

            set((oldState) => {

                if(newState === PintaState.WaitingForMenu) {
                    for(const [,info] of this.stateInfo) {
                        info.startedTimestamp = info.endTimestamp = newTransitionTime;
                    }
                }
                else
                {
                    oldStateInfo.endTimestamp = newTransitionTime;
                    if(oldStateInfo.startedTimestamp > 0) {
                        console.log({ state: oldStateInfo.state, duration: oldStateInfo.endTimestamp - oldStateInfo.startedTimestamp });
                    }
    
                    const newStateInfo = oldState.stateInfo.get(newState) as StateInfo;
                    newStateInfo.startedTimestamp = newTransitionTime;
                }
                return { ...oldState, currentState: newState };
            });
        }
    }
}));