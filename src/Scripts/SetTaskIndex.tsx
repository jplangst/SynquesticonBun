import {taskIndexSignal} from '../ModuleRenderComponent';

export default function SetTaskIndex(newIndex:number|null){

    console.log("TASK INPUT: " + newIndex)

    // Set the task index to the provided index
    if(typeof(newIndex) === 'number'){
        console.log("Setting new index: " + newIndex)
        taskIndexSignal.value = newIndex
    }  
    // If no new index is provided, increment the current index by 1
    else{
        taskIndexSignal.value = taskIndexSignal.value+1
        console.log("Setting new index: " + taskIndexSignal.value)
    }
}