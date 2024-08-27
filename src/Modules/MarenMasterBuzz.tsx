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

type Props = {
    lazyProps : any,
};

// Used to determine if the participants should go thorugh a training run of the buzz stimuli before the proper data collection. 
let performTraining = false
let runNumber = "1"

// Holds the status of the training for each operator
let trainingStatusMap = new Map<string, any>()

//TODO use the TextEntry module instead :P having three copies is silly, it is easy to send a on value 
// change handler to get the value in the module that wants it.
function TextEntry({lazyProps}: Props): ReactElement {
    //const defaultTextValue = lazyProps.DefaultValue;
    let textFieldSize = lazyProps.EntryFieldOptions; 
    const onChange = (e: ChangeEvent<HTMLTextAreaElement>)=> {
        const target = e.target as HTMLTextAreaElement
        if(target){
            runNumber = target.value
        }
    }

    return <textarea disabled={lazyProps.disabled} autofocus className={lazyProps.ClassName} value={runNumber} placeholder={lazyProps.DefaultValue} key={uuidv4()} rows={textFieldSize[1]} cols={textFieldSize[1]} onChange={onChange} />
}

function MarenMasterBuzz({lazyProps}: Props):ReactElement {
    const experimentStarted = useSignal(false)

    let scriptsMap:null|Map<string, any> = null
    if(!experimentObjectSignal.value){
        return(<></>)
    }

    scriptsMap = (experimentObjectSignal.value as { scriptsMap: Map<string, any> }).scriptsMap;

    const broadcastExperimentStartAndStop = () =>{
        const commsObject = CommunicationsObject.value
        const startOfExperimentTimestamp = new Date()
        commsObject.publish(commsObject.commandsTopic, {runNumber:runNumber, experimentStarted:experimentStarted.value, performTraining:performTraining, startTimestamp:startOfExperimentTimestamp.toString()})
    }

    const trainingChecked = () => {
        performTraining = !performTraining
    }

    // This button press will start and stop the experiment
    // When starting the run number will be broadcast to the connected tablets/phones
    const buttonOnClick = () => {    
        if (!scriptsMap) 
            return
    
        experimentStarted.value = !experimentStarted.value

        broadcastExperimentStartAndStop()

        if(!experimentStarted.value){
            // Clear the map
            trainingStatusMap = new Map<string, any>()
            // Clear the comms signal
            commsMessageSignal.value.topic = ""
        }

        //Update the metadate for the station
        const updateMetaData = scriptsMap.get(lazyProps.operatorMetaClick.function)
        updateMetaData.default({runNumber:runNumber});  
    } 

    let buttonClassString =  "bg-sky-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded m-1"
    
    const experimentButton = experimentStarted.value ? "Stop Experiment" : "Start Experiment"

    const addOrUpdateTrainingStatus = (logObject:any) => {
        console.log("Adding training status", logObject)
        // The map already contains this role, so update the value
        if(trainingStatusMap.has(logObject.eventObject.role)){
            let updatedLogObject = trainingStatusMap.get(logObject.eventObject.role)
            updatedLogObject.nmbAnswers = updatedLogObject.nmbAnswers+1
            updatedLogObject.nmbCorrectAnswers = updatedLogObject.nmbCorrectAnswers + logObject.eventObject.accuracy
            trainingStatusMap.set(logObject.eventObject.role, updatedLogObject)
        }
        else{
            trainingStatusMap.set(logObject.eventObject.role, {nmbAnswers:1, nmbCorrectAnswers:logObject.eventObject.accuracy})
        }

        const trainingStatusElements =
            Array.from(trainingStatusMap).map(([key, value]) => (
            <p className="flex-auto text-2xl mr-5">{key}: {value.nmbCorrectAnswers}/{value.nmbAnswers}</p>
            ))

        const trainingStatus = <div className="flex flex-col mt-10"><p className="flex-auto text-2xl">Training status:</p><div className="flex flex-row">{trainingStatusElements}</div></div>

        return trainingStatus
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


    let trainingStatus = null

    // Handle logging event messages
    if(commsMessageSignal.value && commsMessageSignal.value.topic===CommunicationsObject.value.loggingTopic){
        const logMessage = commsMessageSignal.value.message
        //Received a buzz event
        if(logMessage.eventType === "buzz"){ //TODO should add these event types into the comms object as well so we only have to change the string once in there.
            // Training buzz event
            if(logMessage.eventObject.trainingEvent){
                trainingStatus = addOrUpdateTrainingStatus(logMessage)
            }
            else{ // Proper buzz event - recordevent to the log
                if(experimentObjectSignal.value){
                    // Write the event to file
                    const scriptsMap = (experimentObjectSignal.value as { scriptsMap: Map<string, any> }).scriptsMap;
                    scriptsMap.get("WriteEvent").default(logMessage.eventObject)
                }
            }
        } //Recieved a questionnair eevent
        else if(logMessage.eventType === "quest"){
            //The message will contain the header and one row of data
            const eventObject = logMessage.eventObject
            //Update the log object
            let logObject = logEventSignal.value
            logObject.header = eventObject.header
            logObject.data = logObject.data + eventObject.data + "\n"  //Append a new row of data
        }
    }

    return (
        <>
        <p className="text-3xl mb-20">Master Buzz Experiment Controller</p>
        <div className="grid grid-cols-3 grid-rows-3 gap-10">
            <p className="row-start-1 text-xl">Run number: </p>
            <TextEntry lazyProps={{ClassName:"row-start-1 col-start-2 col-span-1 resize-none disabled:text-slate-500 disabled:bg-slate-200",DefaultValue:"1",EntryFieldOptions:[1,1], disabled:experimentStarted.value}}/>

            <label className="text-xl row-start-2 col-start-1" for="trainingCheck">Administer Training</label>
            <input className="m-s-2 w-8 h-8 row-start-2 col-start-2" checked={performTraining} type="checkbox" id="trainingCheck" onChange={trainingChecked}/>

            <button type="button" className={buttonClassString+"row-start-3 col-start-2"} 
                onClick={buttonOnClick}>{lazyProps.label}
                {experimentButton}
            </button>      
        </div>

        <div>
            {trainingStatus}
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
        </>
    )
}

export default MarenMasterBuzz