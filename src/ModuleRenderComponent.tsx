import { signal} from "@preact/signals"

import {useEffect, Suspense} from 'react';
import { callScript } from './Utils/Utils';

export const experimentStartTimestampSignal = signal(new Date())
export const metaDataSignal = signal({runNumber:1,role:"Operator 1"})
export const logEventSignal = signal({header:"",data:""})

export const taskIndexSignal = signal(0)
const moduleToRenderSignal = signal(null)

// Get the module to be rendered from the current taskIndex
function updateModuleToRender(experimentObject:any){
    if(!experimentObject || !experimentObject.taskRenderObjects){
        moduleToRenderSignal.value = null
    }
    moduleToRenderSignal.value = experimentObject.taskRenderObjects[taskIndexSignal.value]
}

function ModuleRenderComponent({experimentObject}:any) {
    // Call any scripts that are to be called on task mount and unmount
    useEffect(() => {
        const currentTaskIndex = taskIndexSignal.value
        //Call script on task mount
        if(experimentObject.codeModulesMap){
            callScript(experimentObject, currentTaskIndex, "onLoad")
        }
        // Call script on task unmount
        return () => {
            if(experimentObject.codeModulesMap){
                callScript(experimentObject, currentTaskIndex, "onUnload")
            }
        }
    },[moduleToRenderSignal.value])

    updateModuleToRender(experimentObject)
    
    return (
        <>
            <Suspense fallback={<></>}>
            <div className="flex flex-col h-screen w-screen bg-sky-100 items-center justify-center whitespace-pre">{moduleToRenderSignal.value}</div>
            </Suspense>
        </>
    )
}

export default ModuleRenderComponent
