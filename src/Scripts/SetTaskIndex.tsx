import {taskIndexSignal} from '../ModuleRenderComponent';

export default function SetTaskIndex(newIndex:number|null){

    

    // Set the task index to the provided index
    if(newIndex){
        console.log("Setting new index: " + newIndex)
        taskIndexSignal.value = newIndex
    }  
    // If no new index is provided, increment the current index by 1
    else{
        taskIndexSignal.value = taskIndexSignal.value+1
        console.log("Setting new index: " + taskIndexSignal.value)
    }
}