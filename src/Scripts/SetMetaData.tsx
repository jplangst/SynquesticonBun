import {metaDataSignal} from '../ModuleRenderComponent';

export default function SetMetaData(metaData:string){
    metaDataSignal.value = metaData
}