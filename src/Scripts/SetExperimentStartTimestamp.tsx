import {experimentStartTimestampSignal} from '../ModuleRenderComponent';

export default function SetExperimentStartTimestamp(){
    experimentStartTimestampSignal.value = new Date()
}