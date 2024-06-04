//External imports
import type {ReactElement} from "react";
import {useEffect} from 'react';
import { signal, batch } from "@preact/signals";

// Our imports
import { experimentObjectSignal } from "../app";
import { experimentStartTimestampSignal } from "../ModuleRenderComponent";
import { getHHMMSSMSMS, getTimeDifference } from "../Utils/Utils";

const taskCountSignal = signal(0)

type Props = {
    lazyProps : any,
};

//Used for logging purposes
let startTimestamp = new Date()
let buzzTimestamp = new Date()
let lastBuzzStimulusDuration = -1
let timer:number = 0

//Used to control the stimuli rendering and the number of repetitions
const repetitionsSignal = signal(0)
const blankScreen = signal(true)

// Called when any of the buttons are pressed
const onBuzzButtonClick = (response:string,lazyProps:any) => {
    //Clear the timeout if a natural button press
    if(response !== "TIMED OUT"){
        clearTimeout(timer)
    }

    //Write the event to the log
    writeBuzzEvent(lazyProps,response)

    // Increment the task count
    taskCountSignal.value = taskCountSignal.value + 1

    // If there are more repetitions repeat the same task
    if(repetitionsSignal.value < lazyProps.taskRepetitions){ 
        onRepetitionButtonClick()
    }
    //Otherwise call the provided onclick function from the experiment file
    else{    
        //Guard against potential null value
        if(!experimentObjectSignal.value){
            console.log("Caught by guard")
            return
        }
        //const scriptsMap = experimentObjectSignal.value.scriptsMap 
        const scriptsMap = (experimentObjectSignal.value as { scriptsMap: Map<string, any> }).scriptsMap;
        const onclickFunction = scriptsMap.get(lazyProps.onclick.function)
        onclickFunction.default(lazyProps.onclick.value);
    }
}

//Write the buzz response event to the log
const writeBuzzEvent = (lazyProps:any, responseIn:string) => {
    if(!experimentObjectSignal.value){
        return
    }

    const metaData = "Test-Participant2-Station3"

    const responseTimestamp = new Date()
    const timeDifference = getTimeDifference(experimentStartTimestampSignal.value,buzzTimestamp)
    console.log(timeDifference)

    const accuracy = (lastBuzzStimulusDuration==500 && responseIn=="SHORT") || (lastBuzzStimulusDuration==1500 && responseIn=="LONG")

    //Prepare the event object payload
    const event = {
        metaData:metaData,
        taskCount:taskCountSignal.value,
        //Actual time e.g. 08:30:500 (mm:ss:msms)
        loadTimestamp:getHHMMSSMSMS(startTimestamp),
        onsetDelay:lazyProps.blackoutTime*1000, //Convert from seconds to ms
        //Relative since start of experiment e.g. 05:00:100 (mm:ss:msms)
        onsetTimestamp:timeDifference,
        stimulusDuration:lastBuzzStimulusDuration,
        responseTime:responseTimestamp.getTime()-buzzTimestamp.getTime(),
        response:responseIn,
        accuracy: accuracy ? 1 : 0
    }

    // Write the event to file
    const scriptsMap = (experimentObjectSignal.value as { scriptsMap: Map<string, any> }).scriptsMap;
    //const scriptsMap = experimentObjectSignal.value.scriptsMap
    scriptsMap.get("WriteEvent").default(event)
}

// Used to override the onclick from the json file until the desired number of repetitions are met
const onRepetitionButtonClick = () => { 
    batch(() => {
        blankScreen.value = true 
        repetitionsSignal.value = repetitionsSignal.value + 1 
    })
}

function BuzzResponse({lazyProps}: Props):ReactElement {
    useEffect(() => {
        startTimestamp = new Date()
        setTimeout(() => {
            blankScreen.value = false;
            // Execute buzzing
            let vibrationType = Math.random() > .5 ? "short" : "long"
            lastBuzzStimulusDuration = vibrationType === "long" ? 1500 : 500
            buzzTimestamp = new Date()
            window.navigator.vibrate(lastBuzzStimulusDuration)
        }, lazyProps.blackoutTime*1000);
    },[repetitionsSignal.value])

    // Show blank screen until the delay is over
    if (blankScreen.value) {
        return (<></>)
    }
    else{
        // From the rendering of the stimuli to the response there is a timeout threshold
        timer = Number(setTimeout(() => {
            const timeoutResponse = "TIMED OUT"
            onBuzzButtonClick(timeoutResponse, lazyProps)
        }, lazyProps.timeoutThreshold*1000));

        let buttonClassString = "w-1/2 h-screen bg-sky-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded m-1"
        const shortResponse = "SHORT"
        const longResponse = "LONG"
        return (
            <>
            <div class="size-full">
                <button type="button" className={buttonClassString} onClick={() => onBuzzButtonClick(shortResponse, lazyProps)}>
                        {shortResponse}
                </button>
                <button type="button" className={buttonClassString} onClick={() => onBuzzButtonClick(longResponse, lazyProps)}>
                        {longResponse}
                </button>
            </div>
            </>
        )
    }
}

export default BuzzResponse