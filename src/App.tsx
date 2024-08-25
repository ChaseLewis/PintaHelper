import { useAudioStore } from './contexts/AudioAnalyzer';
import { FrequencyVisualizer} from './components/FrequencyVisualizer';
import { useEffect } from 'react';
import { useStateMachineStore } from './contexts/StateMachineContext';
import { PintaMap } from './components/PintaMap';
import { LootSelector } from './components/LootSelector';
import { TimingSection } from './components/TimingSection';
import { Settings } from './components/Settings';
import './App.css';
import { Button } from 'antd';

function App() {


  const audioStore = useAudioStore();
  const stateStore = useStateMachineStore();

  useEffect(() => {
    audioStore.start();
    return () => { audioStore.stop() };
  },[]);

  useEffect(() => {

    const handleKeyEvents = (e: KeyboardEvent) => {
      if(e.key === 'd') {
        stateStore.update((state) => {
          return { ...state, debug: !state.debug };
        });
        return;
      }

      if(e.key === 'r') {
        stateStore.update((state) => {
          return { ...state, recordMax: !state.recordMax };
        });
        return;
      }
    }

    window.addEventListener("keydown",handleKeyEvents);
    return () => window.removeEventListener("keydown",handleKeyEvents);
  },[stateStore]);

  return (
    <>
      <div className="panel">
        {/* <div className="img-row">
          <img id="pinta-img" src={pintaImageUrl} title="Pinta Flag Image" />
        </div> */}
        {stateStore.debug && <div className="debug-row">
          <div>Debug</div>
          <div>Recording: {stateStore.recordMax ? "true" : "false"}</div>
          <div>State: {stateStore.currentState}</div>
        </div>}
        <PintaMap displayNumber />
        {audioStore.running ? 
          <>
            <div className="sound-row">
              <FrequencyVisualizer
                width={200}
                height={70}
                style={{
                  width: "100%",
                  height: "100%"
                }}
              />
            </div>
            <TimingSection />
            <div className="timing-selector">
                <LootSelector />
            </div>
            <Settings />
          </>
          :
          <>
            <Button type="default" onClick={() => audioStore.start()}>Start</Button>
          </>
        }

        <div style={{ flex: 1 }} />
      </div>
    </>
  )
}

export default App
