import { signal} from "@preact/signals"

import {useEffect, Suspense, useRef} from 'react';
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
    const moduleRef = useRef(null)
    
    useEffect(() => {
        console.log(moduleRef.current);
      }, []);

    const enterFullscreen = () => {
        const elem = moduleRef.current;
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) { // Firefox
          elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, and Opera
          elem.webkitRequestFullscreen();
        }
      };

      //TODO consider moving this to a script and calling at the end of the experiment
      const exitFullscreen = () => {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { // Firefox
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { // Chrome, Safari, and Opera
          document.webkitExitFullscreen();
        }
      };

     const handleFullscreen = () => {
        if (!document.fullscreenElement) {
          enterFullscreen();
        } else {
          exitFullscreen();
        }
      };

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
            <div className="h-screen w-screen overflow-y" ref={moduleRef}>
            <Suspense fallback={<></>}> 
                <div  className="flex flex-col h-full w-full bg-sky-100 
                items-center justify-center whitespace-pre">
                    {moduleToRenderSignal.value}   
                </div>     
            </Suspense>
            </div>
            <button type="button" className={"bg-sky-500 hover:bg-sky-700 text-white py-2 px-4 rounded m-1 absolute bottom-0 right-0 text-lg"} 
                    onClick={handleFullscreen}>Enter fullscreen</button>     
        </>
    )
}

export default ModuleRenderComponent
