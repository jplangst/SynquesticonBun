//External imports
import type {ReactElement} from "react";

// Our imports
import {logEventSignal} from "../ModuleRenderComponent";

import { experimentObjectSignal, roleSignal, skipSignal } from "../app";
import { handleMapFunctions } from "../Utils/Utils";
import { commsMessageSignal } from "../Communication/communicationModule";
import SetExperimentStartTimestampExternal from "../Scripts/SetExperimentTimestampExternal";

let runNumber = "1"

type Props = {
    lazyProps : any,
};

function WaitingScreen({lazyProps}: Props):ReactElement {
    let scriptsMap:null|Map<string, any> = null

    if(!experimentObjectSignal.value){
        return(<></>)
    }

    scriptsMap = (experimentObjectSignal.value as { scriptsMap: Map<string, any> }).scriptsMap;
    
    const buttonOnClick = () => {    
        if (!scriptsMap) 
            return
    
        //Update the metadate for the station
        const updateMetaData = scriptsMap.get(lazyProps.operatorMetaClick.function)
        updateMetaData.default({runNumber:runNumber, role:roleSignal.value});

        // Add the run number and operator role to the log
        let logObject = logEventSignal.value
        logObject.header = logObject.header + "Run;Role;"
        logObject.data = logObject.data + runNumber + ";" + roleSignal.value +";"
        logEventSignal.value = logObject

        // If there is a on click prop call the corresponding function with the provided parameters
        if(lazyProps.onclick){ 
            handleMapFunctions(scriptsMap, lazyProps.onclick)
        }     
    } 

    if(commsMessageSignal.value && commsMessageSignal.value.topic==="commands"){
        runNumber = commsMessageSignal.value.message.runNumber
        SetExperimentStartTimestampExternal(commsMessageSignal.value.message.startTimestamp)

        let performTraining = commsMessageSignal.value.message.performTraining
        skipSignal.value = !performTraining

        if(commsMessageSignal.value.message.experimentStarted){
            buttonOnClick()
        }

        //Clear the comms message
        if(performTraining){
            commsMessageSignal.value = null
        }
    }

    return (
        <>
        <div className="flex text-wrap flex-col items-center justify-center w-full h-full">
            <div class="mx-5 relative mt-5">
                <p className="w-full text-wrap text-3xl mb-10">Your role is: {roleSignal.value}.</p>
                <div className="w-full text-wrap text-3xl mb-10" dangerouslySetInnerHTML={{ __html: lazyProps.instruction}}/>
                <p className="w-full text-3xl text-wrap">Please "Enter fullscreen" and wait for the experimenter to start the experiment.</p>
            </div>
        </div>
        </>
    )
}

export default WaitingScreen