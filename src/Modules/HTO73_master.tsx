//External imports
import type {ReactElement} from "react";
import {ChangeEvent} from 'react';
import { useSignal } from "@preact/signals";
import { v4 as uuidv4 } from 'uuid';

// Our imports
import { experimentObjectSignal } from "../app";
import { CommunicationsObject, commsMessageSignal } from "../Communication/communicationModule";
import DownloadLogEvents from "../Scripts/DownloadLogEvents";
import ClearEventStorage from "../Scripts/ClearEventStorage";
import { logEventSignal } from "../ModuleRenderComponent";
import TextEntry from "./TextEntryTask";

type Props = {
    lazyProps : any,
};

let runNumber = "1"
let crew = "1"

// Holds the status of the comms for each operator
let commsStatusMap = new Map<string, any>()

//TODO use the TextEntry module instead :P having three copies is silly, it is easy to send a on value 

function HTO73_master({lazyProps}: Props):ReactElement {
    const experimentStarted = useSignal(false)
    const CrewIDValue = "Crew"
    const RunNumberID = "RunNumber"

    const onChange = (value:string, eventId:string)=> {
        if(value){
            console.log(value)
            if(eventId === RunNumberID){
                runNumber = value
            }
            else if(eventId === CrewIDValue){
                crew = value
            }        
        }
    }

    let scriptsMap:null|Map<string, any> = null
    if(!experimentObjectSignal.value){
        return(<></>)
    }

    scriptsMap = (experimentObjectSignal.value as { scriptsMap: Map<string, any> }).scriptsMap;

    const inScenarioClicked = () => {
        const commsObject = CommunicationsObject.value
        const startOfExperimentTimestamp = new Date()
        commsObject.publish(commsObject.commandsTopic, {crew:crew, runNumber:runNumber, startInScenario:true, 
            startTimestamp:startOfExperimentTimestamp.toString()})
    }

    const endOfScenarioClicked = () => {
        const commsObject = CommunicationsObject.value
        const startOfExperimentTimestamp = new Date()
        commsObject.publish(commsObject.commandsTopic, {crew:crew, runNumber:runNumber, startEndOfScenario:true, 
            startTimestamp:startOfExperimentTimestamp.toString()})
    }

    const endOfStudyClicked = () => {
        const commsObject = CommunicationsObject.value
        const startOfExperimentTimestamp = new Date()
        commsObject.publish(commsObject.commandsTopic, {crew:crew, runNumber:runNumber, startEndOfStudy:true, 
            startTimestamp:startOfExperimentTimestamp.toString()})
    }

    let buttonClassString =  "bg-sky-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded m-1"

    const setCommsStatusOff = (role:string) => {
        if(commsStatusMap.has(role)){
            let updatedLogObject = commsStatusMap.get(role)
            updatedLogObject.status = "Timed out"
            commsStatusMap.set(role, updatedLogObject)
        }
    }

    const addOrUpdateCommsStatus = (commsObject:any) => {
        const clearCommsTimer = Number(setTimeout(() => {
            setCommsStatusOff(commsObject.role)
        }, lazyProps.timeoutThreshold*1000));

        // The map already contains this role, so update the value
        if(commsStatusMap.has(commsObject.role)){
            let updatedLogObject = commsStatusMap.get(commsObject.role)
            updatedLogObject.status = "Ok"
            clearTimeout(updatedLogObject.clearTimeout)
            updatedLogObject.clearTimeout = clearCommsTimer
            commsStatusMap.set(commsObject.role, updatedLogObject)
        }
        else{
            commsStatusMap.set(commsObject.role, {status:"Ok", clearTimeout:clearCommsTimer})
        } 
    }

    const getCommsStatusObjects = () => {
        const commsStatusElements = 
            Array.from(commsStatusMap).map(([key, value]) => (
            <p className="flex-auto text-2xl mr-5">{key}: {value.status}</p>
            )) 

        const commsStatus = <div className="flex flex-col mt-10"><p className="flex-auto text-2xl">Comms status:</p><div className="flex flex-row">{commsStatusElements}</div></div>

        return commsStatus
    }

    const downloadFiles = () => {
        let logSource = "localStorage"
        DownloadLogEvents(logSource)
        logSource = "eventLogSignal"
        DownloadLogEvents(logSource)
    }

    const clearStorage = () => {
        ClearEventStorage()
    }

    let commsStatus = null
    // Handle logging event messages
    if(commsMessageSignal.value && commsMessageSignal.value.topic===CommunicationsObject.value.loggingTopic){
        const logMessage = commsMessageSignal.value.message
        //Received a buzz event
        if(logMessage.eventType === "buzz"){ //TODO should add these event types into the comms object as well so we only have to change the string once in there.
            // Check if the event should be logged
            if(experimentObjectSignal.value && !logMessage.eventObject.trainingEvent){
                // Write the event to file
                const scriptsMap = (experimentObjectSignal.value as { scriptsMap: Map<string, any> }).scriptsMap;
                scriptsMap.get("WriteEvent").default(logMessage.eventObject)
            }
        } //Recieved a questionnaire eevent
        else if(logMessage.eventType === "quest"){
            //The message will contain the header and one row of data
            const eventObject = logMessage.eventObject
            //Update the log object
            let logObject = logEventSignal.value
            logObject.header = eventObject.header
            logObject.data = logObject.data + eventObject.data + "\n"  //Append a new row of data
        }     
    }

    // Comms status messages
    if(commsMessageSignal.value && commsMessageSignal.value.topic===CommunicationsObject.value.commsStatusTopic) {
        const logMessage = commsMessageSignal.value.message
        addOrUpdateCommsStatus(logMessage)
    }
    commsStatus = getCommsStatusObjects()

    return (
        <div key="HTO73_controller">
        <p className="text-3xl mb-20">Experiment Controller</p>
        <div className="grid grid-cols-3 grid-rows-3 gap-10">
            <div key="CrewEntryParent" className="row-start-1 text-xl col-start-1">
            <p>Crew: </p>
            <TextEntry key="CrewEntry" lazyProps={{ClassName:"resize-none disabled:text-slate-500 disabled:bg-slate-200",DefaultValue:"Crew1",EntryFieldOptions:[10,1], disabled:experimentStarted.value, onChange:onChange, eventId:"Crew"}}/>
            </div>

            <div key="RunEntryParent" className="row-start-1 text-xl col-start-3">
            <p>Run number: </p>
            <TextEntry key="RunEntry" lazyProps={{ClassName:"resize-none disabled:text-slate-500 disabled:bg-slate-200",DefaultValue:"1",EntryFieldOptions:[10,1], disabled:experimentStarted.value, onChange:onChange, eventId:"RunNumber"}}/>
            </div>

            <button type="button" className={buttonClassString+"row-start-3 col-start-1"} 
                onClick={inScenarioClicked}>
                In-scenario<br/>questionnaire
            </button>    
            <button type="button" className={buttonClassString+"row-start-4 col-start-2"} 
                onClick={endOfScenarioClicked}>
                After scenario<br/>questionnaire
            </button>    
            <button type="button" className={buttonClassString+"row-start-3 col-start-3"} 
                onClick={endOfStudyClicked}>
                End of study<br/>questionnaire
            </button>        
        </div>

        <div>
            {commsStatus}
        </div>

        <div className="grid grid-cols-3 grid-rows-1 gap-10 mt-10">
            <button type="button" className={buttonClassString+"row-start-1 col-start-1"} 
                onClick={downloadFiles}>{lazyProps.label}
                Download data
            </button>    
            <button type="button" className={buttonClassString+"row-start-1 col-start-3"} 
                onClick={clearStorage}>{lazyProps.label}
                Clear local storage
            </button>    
        </div>
        </div>
    )
}

//TODO if time add questionnaire completed status?

export default HTO73_master