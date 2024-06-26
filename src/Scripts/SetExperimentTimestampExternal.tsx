import {experimentStartTimestampSignal} from '../ModuleRenderComponent';

export default function SetExperimentStartTimestampExternal(timestamp:string){
    console.log("SETTING EXTERNAL TIMESTAMP")
    const timestampAsDate = new Date(Date.parse(timestamp))
    experimentStartTimestampSignal.value = {masterTimestamp: timestampAsDate, slaveTimestamp: new Date()}
}