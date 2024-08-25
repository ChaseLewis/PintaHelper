import { Form, InputNumber } from "antd";
import { useStateMachineStore } from "../contexts/StateMachineContext"

export const Settings = () => {
    const stateStore = useStateMachineStore();

    return (
        <div>
            <Form
                layout="inline"
            >
                <Form.Item
                    vertical
                    label="Drift"
                >
                    <InputNumber 
                        value={stateStore.drift} 
                        min={-1} max={1} step={0.016} 
                        onChange={(value) => {
                            stateStore.updateDrift(value || 0);
                        }}
                    />
                </Form.Item>
                <Form.Item
                    vertical
                    label="Anticipation"
                >
                    <InputNumber 
                        value={stateStore.anticipation} 
                        min={0} max={1} step={0.016} 
                        onChange={(value) => {
                            stateStore.updateAnticipation(value || 0);
                        }}
                    />
                </Form.Item>
            </Form>
        </div>
    )
}