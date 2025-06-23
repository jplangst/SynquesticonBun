//External imports
import type {ReactElement} from "react";

// Our imports
import {logEventSignal} from "../ModuleRenderComponent";

import { experimentObjectSignal, skipSignal } from "../app";
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

function notifyUser() {
    audio.play().catch(e => console.error('Audio playback failed:', e));
}

function HTO73WaitingScreen({lazyProps}: Props):ReactElement {
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
        console.log(commsMessage)
        if(commsMessage.startInScenario){
            notifyUser()
            if(lazyProps.inScenario){ 
                handleMapFunctions(scriptsMap, lazyProps.inScenario)
            }       
        }
        else if(commsMessage.startEndOfScenario){
            notifyUser()
            if(lazyProps.endOfScenario){ 
                handleMapFunctions(scriptsMap, lazyProps.endOfScenario)
            }     
        }
        else if(commsMessage.startEndOfStudy){
            notifyUser()
            if(lazyProps.endOfStudy){ 
                handleMapFunctions(scriptsMap, lazyProps.endOfStudy)
            }     
        }
    } 

    if(commsMessageSignal.value && commsMessageSignal.value.topic==="commands"){
        crew = commsMessageSignal.value.message.crew
        runNumber = commsMessageSignal.value.message.runNumber
        SetExperimentStartTimestampExternal(commsMessageSignal.value.message.startTimestamp)

        //let performTraining = commsMessageSignal.value.message.performTraining
        //skipSignal.value = !performTraining

        //if(commsMessageSignal.value.message.experimentStarted){
        buttonOnClick(commsMessageSignal.value.message)
        //}

        //Clear the comms message
        //if(performTraining){
        commsMessageSignal.value = null
        //}
    }

    console.log(document.fullscreenElement)
    let fullScreenInstruction = document.fullscreenElement != null ? null : <p className="w-full text-3xl text-wrap">Please "Enter fullscreen" and wait for the experimenter to start the experiment.</p>

    //TODO add event listener for fullscreen change and update the fullScreenInstruction accordingly. Just hide the instruction for now. 
    fullScreenInstruction = null

    return (
        <>
        <div className="flex text-wrap flex-col items-center justify-center w-full h-full">
            <div class="mx-5 relative mt-5">
                <p className="w-full text-wrap text-3xl mb-10">Your role is: {roleSignal.value}.</p>
                <div className="w-full text-wrap text-3xl mb-10" dangerouslySetInnerHTML={{ __html: lazyProps.instruction}}/>
                {fullScreenInstruction}
            </div>
        </div>
        </>
    )
}

export default HTO73WaitingScreen