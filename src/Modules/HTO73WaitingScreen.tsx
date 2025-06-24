//External imports
import type {ReactElement} from "react";
import { useEffect } from "react";

// Our imports
import {logEventSignal} from "../ModuleRenderComponent";

import { experimentObjectSignal } from "../app";
import {roleSignal} from "../SignalStore";
import { handleMapFunctions } from "../Utils/Utils";
import { commsMessageSignal } from "../Communication/communicationModule";
import SetExperimentStartTimestampExternal from "../Scripts/SetExperimentTimestampExternal";

let runNumber = "1"
let crew = "1"

type Props = {
    lazyProps : any,
};

const audio = new Audio('Sounds/notificationAlert.mp3'); // Replace with correct path
audio.load(); // preload it
let audioUnlocked = false;

function unlockAudioOnFirstTap() {
    if (audioUnlocked) return;

    audio.play().then(() => {
        audio.pause(); // Pause immediately
        audioUnlocked = true;
        console.log("✅ Audio unlocked by user tap");
    }).catch(err => {
        console.warn("⚠️ Audio unlock failed:", err);
    });
}

function notifyUser() {
    audio.play().catch(e => console.error('Audio playback failed:', e));
}

function HTO73WaitingScreen({lazyProps}: Props):ReactElement {
    useEffect(() => {
        // Attach a one-time listener to unlock audio
        document.addEventListener("touchstart", unlockAudioOnFirstTap, { once: true });
        document.addEventListener("click", unlockAudioOnFirstTap, { once: true });
    }, []);

    let scriptsMap:null|Map<string, any> = null

    if(!experimentObjectSignal.value){
        return(<></>)
    }

    scriptsMap = (experimentObjectSignal.value as { scriptsMap: Map<string, any> }).scriptsMap;
    
    //TODO should just set the index from the comms message here instead of going through the text item module!!!
    const buttonOnClick = (commsMessage:any) => {    
        if (!scriptsMap) 
            return
    
        //Update the metadate for the station
        const updateMetaData = scriptsMap.get(lazyProps.operatorMetaClick.function)
        updateMetaData.default({runNumber:runNumber, role:roleSignal.value});

        // Add the run number and operator role to the log
        let logObject = logEventSignal.value
        logObject.header = logObject.header + "Crew;Run;Role;"
        logObject.data = logObject.data + crew + ";" + runNumber + ";" + roleSignal.value +";"
        logEventSignal.value = logObject

        //Check which message was sent and set task index accordingly
        let shouldNotify = true
        if(commsMessage.startInScenario){
            if(lazyProps.inScenario){ 
                handleMapFunctions(scriptsMap, lazyProps.inScenario)
            }       
        }
        else if(commsMessage.startEndOfScenario){
            if(lazyProps.endOfScenario){ 
                handleMapFunctions(scriptsMap, lazyProps.endOfScenario)
            }     
        }
        else if(commsMessage.startEndOfStudy){
            if(lazyProps.endOfStudy){ 
                handleMapFunctions(scriptsMap, lazyProps.endOfStudy)
            }     
        }
        else{
            shouldNotify = false;
        }

        if (shouldNotify){
            notifyUser();
        }
    } 

    if(commsMessageSignal.value && commsMessageSignal.value.topic==="commands"){
        crew = commsMessageSignal.value.message.crew
        runNumber = commsMessageSignal.value.message.runNumber
        SetExperimentStartTimestampExternal(commsMessageSignal.value.message.startTimestamp)

        buttonOnClick(commsMessageSignal.value.message)

        commsMessageSignal.value = null
    }

    const enableSoundInstruction = audioUnlocked ? null : <p className="w-full text-wrap text-3xl mb-10">Please tap the screen to enable sound</p>

    return (
        <>
        <div className="flex text-wrap flex-col items-center justify-center w-full h-full">
            <div class="mx-5 relative mt-5">
                <p className="w-full text-wrap text-3xl mb-10">Your role is: {roleSignal.value}.</p>
                <div className="w-full text-wrap text-3xl mb-10" dangerouslySetInnerHTML={{ __html: lazyProps.instruction}}/>
                {enableSoundInstruction}
            </div>
        </div>
        </>
    )
}

export default HTO73WaitingScreen