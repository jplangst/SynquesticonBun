//External imports
import type {ReactElement} from "react";
import {ChangeEvent} from 'react';
import { signal } from "@preact/signals";
import { v4 as uuidv4 } from 'uuid';

// Our imports
import {logEventSignal} from "../ModuleRenderComponent";

import { experimentObjectSignal, roleSignal } from "../app";
import { handleMapFunctions } from "../Utils/Utils";
import { commsMessageSignal } from "../Communication/communicationModule";


//TODO This shall be set via mqtt message
let runNumber = "1"

type Props = {
    lazyProps : any,
};

//TODO use the role=operator station from the url instead. 
//We can save the webpage with the correct url for one station per phone. 
//Create a shortcut on the start screen of the phone.
//Create a waiting module that waits for the start experiment signal, a text field shows the role 
//and instructions, e.g. you will be prompted with a long or short vibration throughout the operator process, you should tap the short or long button depending on the length of the vibration.
//Please await until the process starts. 

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

        if(commsMessageSignal.value.message.experimentStarted){
            buttonOnClick()
        }
    }

    return (
        <>
        <div className="flex text-wrap flex-col items-center justify-center w-screen h-screen">
        <div class="w-11/12 relative mb-6">
            <p className="w-full text-wrap text-3xl mb-20">Your role is: {roleSignal.value}.</p>
            <div className="w-full text-wrap text-3xl mb-20" dangerouslySetInnerHTML={{ __html: lazyProps.instruction}}/>
            <p className="w-full text-3xl text-wrap mb-20">Please "Enter fullscreen" and wait for the experimenter to start the experiment.</p>
        </div>
        </div>
        </>
    )
}

export default WaitingScreen