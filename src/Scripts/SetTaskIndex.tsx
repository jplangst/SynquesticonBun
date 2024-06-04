import {taskIndexSignal} from '../ModuleRenderComponent';

export default function SetTaskIndex(newIndex:number|null){
    if(newIndex){
        //console.log("Updating index from: "+taskIndexSignal.value+" to newIndex:"+newIndex)
        taskIndexSignal.value = newIndex
    }  
    else{
        //console.log("Updating index to old index+1:"+taskIndexSignal.value+1)
        taskIndexSignal.value = taskIndexSignal.value+1
    }
}