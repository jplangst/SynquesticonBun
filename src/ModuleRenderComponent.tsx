import { signal} from "@preact/signals"

import {useEffect, Suspense, useRef} from 'react';
import { callScript } from './Utils/Utils';

import { v4 as uuidv4 } from 'uuid';
export const deviceLogUUID = uuidv4()


export const experimentStartTimestampSignal = signal({masterTimestamp: new Date(), slaveTimestamp: new Date()})
console.log("Module Render :" + experimentStartTimestampSignal.value.masterTimestamp.toString())
export const metaDataSignal = signal({runNumber:1,role:"Operator 1"})
export const logEventSignal = signal({header:"",data:""})
//export const skipSignal = signal(false)



export const taskIndexSignal = signal(0)
export const toastMessageSignal = signal({text:"", display:"hidden"})
const moduleToRenderSignal = signal(null)

//TODO consider creating unique local storage objects so that multiple instances on a single device do not affect each other. Maybe just add some UIDD or something. 

//TODO add an MQTT listener that listens for questionnaire and buzz answers on the experiment control module. Write the events to the local storage and eventlogsignal respectively. 
//    We can reuse the logic that already exist in write event and download event. If writing buzz use the LocalStorage, if writing questionnaire responses use the EventLogSignal. 
//TODO add MQTT messages when writing to the log file to broadcast the answer to the experiment controller.
//TODO add a button that downloads the mqtt answers as csv file and clears the local storage and eventlogsignal. Download 2csv files. one for the buzz and one for the quest. Use the run number and buzz/quest file prefix

//TODO refactor modules so that they use existing modules instead of making their own if possible

//TODO Filename . Add another parameter to the download function that specifies a prefix to the filename. E.g. buzz_ or quest_ 

// Get the module to be rendered from the current taskIndex
function updateModuleToRender(experimentObject:any){
    if(!experimentObject || !experimentObject.taskRenderObjects){
        moduleToRenderSignal.value = null
    }
    moduleToRenderSignal.value = experimentObject.taskRenderObjects[taskIndexSignal.value]
}

export function toastMessage(message:string, duration:number){
    toastMessageSignal.value = {text:message, display:""} //Was "block"
    setTimeout(() => {
        toastMessageSignal.value = {text:"", display:"hidden"}
    }, duration*1000);
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

        //TODO fullscreen did not work on the ipad's chrome version.........
        //TODO when in fullscreen in safari the next module is not loaded after a fiel is downloaded. When not in fullscreen it works...
        //TODO test with chrome instead on the ipads...
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
          //exitFullscreen();
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

    //Fullscreen in ios is not supported in ios. There is a user interaction in fullscreen warning popup that is very disruptive
    const fullScreenButton = ((/iPad|iPhone|iPod/.test(navigator.userAgent))||(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) ? null 
                              : <button ref={fullscreenRef} type="button" onClick={handleFullscreen} 
                              className={"select-none bg-sky-500 hover:bg-sky-700 text-white py-2 px-4 rounded m-1 absolute bottom-5 right-5 text-lg"}>
                                Enter fullscreen</button>  

    //NB make sure everything that should be visible in fullscreen is inside the moduleRef div!!
    return (
        <>
            <div className="h-full w-full fixed overflow-hidden" ref={moduleRef}>
            <Suspense fallback={<></>}> 

              <div className={"z-40 absolute flex w-full h-full place-content-center items-center "+toastMessageSignal.value.display}>
                <div className="flex bg-gray-900 text-white p-4 text-7xl rounded-md ">
                  <p>{toastMessageSignal.value.text}</p>
                </div>
              </div> 

              <div  className="z-0 select-none flex flex-col h-full w-full bg-sky-100 
              items-center justify-center">
                  {moduleToRenderSignal.value}   
              </div>  
            </Suspense>          
            </div>

            {fullScreenButton}  
        </>
    )
}

export default ModuleRenderComponent