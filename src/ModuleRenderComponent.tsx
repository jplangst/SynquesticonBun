import { signal} from "@preact/signals"

import {useEffect, Suspense, useRef} from 'react';
import { callScript } from './Utils/Utils';

export const experimentStartTimestampSignal = signal({masterTimestamp: new Date(), slaveTimestamp: new Date()})
console.log("Module Render :" + experimentStartTimestampSignal.value.masterTimestamp.toString())
export const metaDataSignal = signal({runNumber:1,role:"Operator 1"})
export const logEventSignal = signal({header:"",data:""})
export const skipSignal = signal(false)

export const taskIndexSignal = signal(0)
const moduleToRenderSignal = signal(null)

//TODO consider how a run plan can be used to automate the setup of the experiments
//TODO refactor modules so that they use existing modules instead of making their own if possible

// Get the module to be rendered from the current taskIndex
function updateModuleToRender(experimentObject:any){
    if(!experimentObject || !experimentObject.taskRenderObjects){
        moduleToRenderSignal.value = null
    }
    moduleToRenderSignal.value = experimentObject.taskRenderObjects[taskIndexSignal.value]
}

function ModuleRenderComponent({experimentObject}:any) {
    const moduleRef = useRef<HTMLDivElement | null>(null);
    const fullscreenRef = useRef<HTMLButtonElement | null>(null);
    
    useEffect(() => {
        console.log(moduleRef.current);
      }, []);

    const enterFullscreen = () => {
        const elem = moduleRef.current;
        if(!elem){
          return
        }

        const docElmWithBrowsersFullScreenFunctions = elem as HTMLDivElement & {
          mozRequestFullScreen(): Promise<void>;
          webkitRequestFullscreen(): Promise<void>;
          msRequestFullscreen(): Promise<void>;
        };

        //TODO test fullscreen on computer, andorid phone and ios tablet
        if (docElmWithBrowsersFullScreenFunctions.requestFullscreen) {
          docElmWithBrowsersFullScreenFunctions.requestFullscreen();
        } else if (docElmWithBrowsersFullScreenFunctions.webkitRequestFullscreen) { // Chrome, Safari, and Opera
          docElmWithBrowsersFullScreenFunctions.webkitRequestFullscreen();
        } else if (docElmWithBrowsersFullScreenFunctions.mozRequestFullScreen) { // Firefox
          docElmWithBrowsersFullScreenFunctions.mozRequestFullScreen();
        }
        (screen.orientation as any).lock("landscape-primary");
      };

      //TODO consider moving this to a script and calling at the end of the experiment
      const exitFullscreen = () => {
        const docWithBrowsersExitFunctions = document as Document & {
          mozCancelFullScreen(): Promise<void>;
          webkitExitFullscreen(): Promise<void>;
          msExitFullscreen(): Promise<void>;
        };

        if (docWithBrowsersExitFunctions.exitFullscreen) {
          docWithBrowsersExitFunctions.exitFullscreen();
        } else if (docWithBrowsersExitFunctions.webkitExitFullscreen) { // Chrome, Safari, and Opera
          docWithBrowsersExitFunctions.webkitExitFullscreen();
        } else if (docWithBrowsersExitFunctions.mozCancelFullScreen) { // Firefox
          docWithBrowsersExitFunctions.mozCancelFullScreen();
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

        //if (!document.fullscreenElement && fullscreenRef.current) {
        //  fullscreenRef.current.click()
        //}

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
                items-center justify-center  overflow-y-auto">
                    {moduleToRenderSignal.value}   
                </div>     
            </Suspense>
            </div>
            <button ref={fullscreenRef} type="button" className={"bg-sky-500 hover:bg-sky-700 text-white py-2 px-4 rounded m-1 absolute bottom-0 right-0 text-lg"} 
                    onClick={handleFullscreen}>Enter fullscreen</button>     
        </>
    )
}

export default ModuleRenderComponent