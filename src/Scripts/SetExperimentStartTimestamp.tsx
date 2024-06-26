import {experimentStartTimestampSignal} from '../ModuleRenderComponent';

export default function SetExperimentStartTimestamp(){
    const startDate = new Date()
    experimentStartTimestampSignal.value = {masterTimestamp: startDate, slaveTimestamp: startDate}
}