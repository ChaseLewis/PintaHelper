import { Form, InputNumber } from "antd";
import { useStateMachineStore } from "../contexts/StateMachineContext"

export const Settings = () => {
    const stateStore = useStateMachineStore();

    return (
        <div>
            <Form
                layout="inline"
                style={{ width: "100%" }}
            >
                <Form.Item
                    label="Drift"
                    style={{ flex: "1" }}
                >
                    <InputNumber 
                        value={stateStore.drift} 
                        min={-1} max={1} step={0.016} 
                        onChange={(value) => {
                            stateStore.updateDrift(value || 0);
                        }}
                        style={{ width: "100%", marginLeft: '5px' }}
                    />
                </Form.Item>
                <Form.Item
                    label="Anticipation"
                    style={{ flex: "1" }}
                >
                    <InputNumber 
                        value={stateStore.anticipation} 
                        min={0} max={1} step={0.016} 
                        onChange={(value) => {
                            stateStore.updateAnticipation(value || 0);
                        }}
                        style={{ width: "100%", marginLeft: '5px' }}
                    />
                </Form.Item>
            </Form>
        </div>
    )
}