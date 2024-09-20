//External imports
import type {ReactElement} from "react";
import {useEffect} from 'react';
import { useSignal, signal, batch } from "@preact/signals";

// Our imports
import { experimentObjectSignal } from "../app";
import { experimentStartTimestampSignal, toastMessage } from "../ModuleRenderComponent";
import {metaDataSignal} from '../ModuleRenderComponent';
import { getHHMMSSMSMS, getTimeDifference } from "../Utils/Utils";
import {CommunicationsObject, commsMessageSignal} from '../Communication/communicationModule';

const timeObject = signal({nextBuzzTimestampInMasterTime: new Date(), updatedMasterTimestamp: new Date(), timeUntilBuzzEvent: 0})

type Props = {
    lazyProps : any,
};

const fastResponse = "FAST"
const slowResponse = "SLOW"

let lastBuzzStimulusDuration = -1
let timer:number = 0

function BuzzResponse({lazyProps}: Props):ReactElement {
    //Used to control the stimuli rendering and the number of repetitions
    const repetitionsSignal = useSignal(0)
    const blankScreen = useSignal(true)
    const taskCountSignal = useSignal(1)

    //Create an interval which repeatedly updates the time until the next buzz event
    useEffect(() => {
        const intervalDriverSignal = setInterval(() => {
            updateTimes(lazyProps)
        },50)

        //Clear the interval when the component is unmounted
        return () => {
            clearInterval(intervalDriverSignal)
            clearTimeout(timer)
        }
    }, [])

    const getRenderObject = (lazyProps:any) => {
        if (blankScreen.value) {
            let hideTimerDataClassString=""
            if(!lazyProps.showTimerInformation){
                hideTimerDataClassString = "text-sky-400/0 select-none"
            }
    
            return (<>
            <div className={"w-full h-full flex flex-col bg-sky-500 "+hideTimerDataClassString}>
                <div className="text-3xl">Start of experiment: {getHHMMSSMSMS(experimentStartTimestampSignal.value.masterTimestamp)}</div>
                <div className="text-3xl">Next buzz event: {getHHMMSSMSMS(timeObject.value.nextBuzzTimestampInMasterTime)}</div>
    
                <div className="text-3xl">Relative updated time: {getHHMMSSMSMS(timeObject.value.updatedMasterTimestamp)}</div>
                <div className="text-3xl">Time until next buzz event: {(timeObject.value.timeUntilBuzzEvent/1000).toFixed(2)} s</div>
            </div>
            </>)
            
        }
        else{
            // From the rendering of the stimuli to the response there is a timeout threshold
            //Clear the timeout timer if it alreacy exist
            clearTimeout(timer) //NB testing. Thinking it should be cleared anyway???
            timer = Number(setTimeout(() => {
                const timeoutResponse = "TIMED OUT"
                onBuzzButtonClick(timeoutResponse, lazyProps)
            }, lazyProps.timeoutThreshold*1000));
    
            let buttonClassString = "w-1/2 h-11/12 bg-sky-500 hover:bg-sky-700 text-white font-bold text-7xl py-2 px-4 rounded m-1"


            return (
                <>
                <div class="size-full flex">
                    <button type="button" className={buttonClassString} onClick={() => onBuzzButtonClick(fastResponse, lazyProps)} onTouchStart={() => onBuzzButtonClick(fastResponse, lazyProps)}>
                            {fastResponse}
                    </button>
                    <button type="button" className={buttonClassString} onClick={() => onBuzzButtonClick(slowResponse, lazyProps)} onTouchStart={() => onBuzzButtonClick(slowResponse, lazyProps)}>
                            {slowResponse}
                    </button>
                </div>
                </>
            )
        }
    }

    const updateTimes = (lazyProps:any) => {
        const experimentMasterTimestamp = experimentStartTimestampSignal.value.masterTimestamp
    
        //Get the relative time since the start on the slave device
        const slaveTimestamp =  experimentStartTimestampSignal.value.slaveTimestamp
        const currentTimestamp = new Date()
        const relativeSlaveTimeDifference_ms = currentTimestamp.getTime()-slaveTimestamp.getTime()
    
        //Update the master timestamp with the relative time difference to get the time since the start of the experiment
        const updatedMasterTimestamp = new Date(experimentMasterTimestamp.getTime()+relativeSlaveTimeDifference_ms)
    
        //Convert the last buzz time to relative time and add to the updated master time to get the buzz timestamp in master time
        const relativePrevBuzzTimestamp_ms = buzzTimestamp.getTime()-slaveTimestamp.getTime()
        //const prevBuzzTimestamp = new Date(experimentMasterTimestamp.getTime()+relativePrevBuzzTimestamp_ms)
    
        //Calculate the time until the next buzz event. Use the timestamp given by the master device
        const nextBuzzTimestampInMasterTime = new Date(experimentMasterTimestamp.getTime()+relativePrevBuzzTimestamp_ms+lazyProps.blackoutTime*1000)
        const timeUntilBuzzEvent = nextBuzzTimestampInMasterTime.getTime() - updatedMasterTimestamp.getTime()
    
        timeObject.value = {nextBuzzTimestampInMasterTime:nextBuzzTimestampInMasterTime, updatedMasterTimestamp: updatedMasterTimestamp, timeUntilBuzzEvent: timeUntilBuzzEvent}
    
        if(timeUntilBuzzEvent <= 0){
            blankScreen.value = false
            // Execute buzzing
            presentBuzzStimuli(lazyProps)
        }
    }

    const createAnswerObject = (responseIn:string) => {
        const metaDataObject = metaDataSignal.value

        const responseTimestamp = new Date()
        const relativeTimeDifference = getTimeDifference(experimentStartTimestampSignal.value.masterTimestamp,buzzTimestamp) //Time difference relative to experiment start
        //const timeDifference = getTimeDifference(startTimestamp,buzzTimestamp) //Time difference relative to module start timestamp
        
        const stimuliDurationCheck = (lastBuzzStimulusDuration===lazyProps.shortVibrationPulseDuration) ? fastResponse : slowResponse
        const accuracy = (stimuliDurationCheck===responseIn) ? 1 : 0
        //const accuracy = (lastBuzzStimulusDuration==lazyProps.shortVibrationPulseDuration && responseIn==fastResponse) || (lastBuzzStimulusDuration==lazyProps.longVibrationPulseDuration && responseIn==slowResponse)

        // Run Number | Role | Buzz Number | BuzzTimestamp-Abs | BuzzTimestamp-Rel | 
        // Response Time (relative to BuzzTimestamp-Abs) | Stimulus Duration | Response | Accuracy
        //Prepare the event object payload
        const event = {
            runNumber:metaDataObject.runNumber,
            role:metaDataObject.role,
            buzzNmb:taskCountSignal.value,
            //Actual time e.g. 08:30:500 (mm:ss:msms)
            BuzzTimestampAbs:getHHMMSSMSMS(buzzTimestamp),
            //Relative since start of experiment e.g. 05:00:100 (mm:ss:msms)
            BuzzTimestampRel:relativeTimeDifference,
            responseTime:responseTimestamp.getTime()-buzzTimestamp.getTime(),
            //onsetTimestamp:timeDifference,
            stimulusDuration:lastBuzzStimulusDuration,
            response:responseIn,
            accuracy: accuracy,
            trainingEvent: lazyProps.conditionalTraining ? true : false,
            showFeedback: lazyProps.showFeedback
        }

        return event
    }

    //Write the buzz response event to the log
    const writeBuzzEvent = (event:any) => {
        if(!experimentObjectSignal.value){
            return
        }

        // Write the event to file
        const scriptsMap = (experimentObjectSignal.value as { scriptsMap: Map<string, any> }).scriptsMap;
        scriptsMap.get("WriteEvent").default(event)
    }

    // Used to override the onclick from the json file until the desired number of repetitions are met
    const onRepetitionButtonClick = () => { 
        batch(() => {
            blankScreen.value = true 
            repetitionsSignal.value = repetitionsSignal.value + 1 
        })
    }

    const presentBuzzStimuli = (lazyProps:any) => {
        let vibrationType = Math.random() > .5 ? fastResponse : slowResponse
        lastBuzzStimulusDuration = (vibrationType === slowResponse) ? lazyProps.longVibrationPulseDuration : lazyProps.shortVibrationPulseDuration
        buzzTimestamp = new Date()

        const nmbPulses = Math.floor(lazyProps.vibrationDuration/(lastBuzzStimulusDuration+lastBuzzStimulusDuration))
        const vibrationPattern = Array(nmbPulses).fill([lastBuzzStimulusDuration,lastBuzzStimulusDuration]).flat()

        window.navigator.vibrate(vibrationPattern)
    }

    // Called when any of the buttons are pressed
    const onBuzzButtonClick = (response:string,lazyProps:any) => {
        //Clear the timeout if a natural button press
        if(response !== "TIMED OUT"){
            clearTimeout(timer)
        }

        const answerObject = createAnswerObject(response)
        //Write the answer to the log
        if(!lazyProps.conditionalTraining){
            writeBuzzEvent(answerObject)
        }
        else if (lazyProps.presentFeedback){
            const toastText = answerObject.accuracy ? "Correct" : "Incorrect"
            toastMessage(toastText, 2)
        }
        // Broadcast the answer over mqtt if configured to do so
        if(lazyProps.broadcastAnswers){
            const commsObject = CommunicationsObject.value
            commsObject.publish(commsObject.loggingTopic, {eventType:"buzz", eventObject: answerObject})
        }

        // Increment the task count
        taskCountSignal.value = taskCountSignal.value + 1

        // Check if the component is MQTT controlled
        if(lazyProps.mqttControlled){
            mqttControlledExperiment(lazyProps)
        }
        else{ //Otherwise it is repetition based
            // If there are more repetitions repeat the same task
            if(repetitionsSignal.value < lazyProps.taskRepetitions){ 
                onRepetitionButtonClick()
            }
            //Otherwise call the provided onclick function from the experiment file
            else{    
                stopBuzzExperiment(lazyProps)
            }
        }
    }

    //Used for logging purposes
    let buzzTimestamp = new Date()

    const stopBuzzExperiment = (lazyProps:any) => {
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

    const mqttControlledExperiment = (lazyProps:any) => {
        if(commsMessageSignal.value && commsMessageSignal.value.topic==="commands"){
            const experimentStarted = commsMessageSignal.value.message.experimentStarted
            if(!experimentStarted){
                stopBuzzExperiment(lazyProps)
            }
        }

        onRepetitionButtonClick()
        
        
        /*console.log(commsMessageSignal.value)
        if(commsMessageSignal.value && commsMessageSignal.value.topic==="commands"){
            const experimentStarted = commsMessageSignal.value.message.experimentStarted
            if(experimentStarted){
                console.log("Repeating")
                onRepetitionButtonClick()
            }
            else{
                stopBuzzExperiment(lazyProps)
            }
        }*/
    }
    
    //if(commsMessageSignal.value && commsMessageSignal.value.topic==="commands" && commsMessageSignal.value.message.experimentStarted===false){
    if(commsMessageSignal.value && commsMessageSignal.value.topic==="commands" && commsMessageSignal.value.message.startBuzz===false){
        const timeoutResponse = "INTERRUPTED"
        onBuzzButtonClick(timeoutResponse, lazyProps)
    }

    //Get the correct render object based on the state of the component: blank screen or stimuli
    return getRenderObject(lazyProps)
}

export default BuzzResponse