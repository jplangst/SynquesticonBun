import { v4 as uuidv4 } from 'uuid';
import { setUUID } from '../Logging/loggingModule';

import SetMetaData from '../Scripts/SetMetaData';
import SetExperimentStartTimestamp from '../Scripts/SetExperimentStartTimestamp';
import writeEvent from '../Scripts/WriteEvent';
import addComponentEventData from '../Scripts/AddComponentEventData';
import getExperimentData from '../GetExperimentData';

// Load the provided experiment json file from the server. If none is provided loads the default experiment. 
// Also generated a user UUID
export async function fetchExperiment(experimentSignal:any,filepath:string|null){
    let response;
    if(filepath) 
        response = await fetch("Experiments/"+filepath+".json");
    else
        response = await fetch("Experiments/defaultExperiment.json");

    const data = await response.text();
    let parsedData = JSON.parse(data);
    parsedData.UUID = uuidv4();
    setUUID(parsedData.UUID )
    console.log(parsedData)
    experimentSignal.value=parsedData;
}

// Inject functions that we need to call deeper in the children tree
function injectScripts(scriptsMap:Map<string,any>){
    const addComponentDataFunc = {default: addComponentEventData}
    scriptsMap.set("AddComponentData", addComponentDataFunc)
  
    const writeEventDataFunc = {default: writeEvent}
    scriptsMap.set("WriteEvent", writeEventDataFunc)

    const setExperimentStartTimestamp = {default: SetExperimentStartTimestamp}
    scriptsMap.set("SetExperimentStartTimestamp", setExperimentStartTimestamp)

    const setMetaData = {default: SetMetaData}
    scriptsMap.set("SetMetaData", setMetaData)
}

export async function fetchData(experimentObjectSignal:any, experimentDataSignal:any){
    const [scriptsMap, codeModulesMap, tasks] = await getExperimentData(experimentDataSignal.value.taskStack)
    injectScripts(scriptsMap)
    const experimentObject = {scriptsMap:scriptsMap,codeModulesMap:codeModulesMap,taskRenderObjects:tasks}
    experimentObjectSignal.value = experimentObject
}    

// Calls a function script that was dynamically loaded if the task index exists in the code modules list and the run type is correct
export function callScript(experimentObject:any, taskIndex:number, runType:string){
    const codeModulesMap = experimentObject.codeModulesMap
    if(codeModulesMap.has(taskIndex)){
        const codeModules = codeModulesMap.get(taskIndex)
        for(const codeModuleIndex in codeModules){
            const codeModule = codeModules[codeModuleIndex]
            if(codeModule.props.runType === runType){
                //console.log("Calling script: " + codeModule.module + " with run type: " + runType + " and task index: " + taskIndex)
                let dynFunction = experimentObject.scriptsMap.get(codeModule.module).default

                if(codeModule.props.functionInput){
                    dynFunction(codeModule.props.functionInput)
                }
                else{
                    dynFunction()
                }
            }
        }
    }
}

export function getTimeDifference(date1:Date, date2:Date) {
    const diffInMs = date2.getTime() - date1.getTime();

    const ms = diffInMs % 1000;
    const seconds = Math.floor((diffInMs / 1000) % 60);
    const minutes = Math.floor((diffInMs / (1000 * 60)) % 60);

    // Pad the minutes and seconds with leading zeros if they are less than 10
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    const formattedMs = String(ms).padStart(3, '0');

    return `${formattedMinutes}:${formattedSeconds}:${formattedMs}`;
}

export function getHHMMSSMSMS(date:Date) {
    const ms = date.getMilliseconds();
    const seconds = date.getSeconds();
    const minutes = date.getMinutes();
    const hours = date.getHours()

    // Pad the minutes and seconds with leading zeros if they are less than 10
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    const formattedMs = String(ms).padStart(3, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}:${formattedMs}`;
}

export function handleMapFunctions(scriptsMap:any, functionData:any){
    //If array then multiple functions to call
    if (Array.isArray(functionData)){
        for (let i = 0; i < functionData.length;i++){//let funcData in functionData){
            callFunctionFromMap(scriptsMap, functionData[i])
        }
    }
    else{
        callFunctionFromMap(scriptsMap, functionData)
    }
}

function callFunctionFromMap(scriptsMap:any, functionData:any){
    let onclickFunction = null 

    if (typeof functionData.function === "string"){
        if(scriptsMap.has(functionData.function)){
            onclickFunction = scriptsMap.get(functionData.function)
        }
        else{
            console.log("Function not found in scripts map: " + functionData.function)        
        }
    }
    else{
        onclickFunction = functionData.function
    }
    const functionValue = functionData.value

    // If the onclick function has been overridden
    if(!onclickFunction.default){
        onclickFunction(functionValue);
    }
    //If there is a value to pass to the function
    else if(functionValue){
        onclickFunction.default(functionValue);
    }
    // If there is no value to pass
    else{ 
        onclickFunction.default();
    }
}