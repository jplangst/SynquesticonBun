import {metaDataSignal} from '../ModuleRenderComponent';

export default function SetMetaData(metaData:any){
    metaDataSignal.value = metaData
}