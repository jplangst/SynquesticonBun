//External imports
import type {ReactElement} from "react";
import {ChangeEvent} from 'react';
import { signal } from "@preact/signals";
import { v4 as uuidv4 } from 'uuid';

// Our imports
import {logEventSignal} from "../ModuleRenderComponent";

import { experimentObjectSignal } from "../app";
import { handleMapFunctions } from "../Utils/Utils";
import { commsMessageSignal } from "../Communication/communicationModule";
import SetExperimentStartTimestampExternal from "../Scripts/SetExperimentTimestampExternal";

const operatorStation = signal("")

type Props = {
    lazyProps : any,
};

let runNumber = "1"

function TextEntry({lazyProps}: Props): ReactElement {
    let textFieldSize = lazyProps.EntryFieldOptions; 
    const onChange = (e: ChangeEvent<HTMLTextAreaElement>)=> {
        const target = e.target as HTMLTextAreaElement
        if(target){
            runNumber = target.value
        }
    }
    return <textarea autofocus className={lazyProps.ClassName} value={runNumber} placeholder={lazyProps.DefaultValue} key={uuidv4()} rows={textFieldSize[1]} cols={textFieldSize[1]} onChange={onChange} />
}

// Called when any of the buttons are pressed
const onStationButtonClick = (response:string) => {
    operatorStation.value = response
}

function ExperimentMetaStart({lazyProps}: Props):ReactElement {
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
        updateMetaData.default({runNumber:runNumber, role:operatorStation.value});

        // Add the run number and operator role to the log
        let logObject = logEventSignal.value
        logObject.header = logObject.header + "Run;Role;StartTime;"
        logObject.data = logObject.data + runNumber + ";" + operatorStation.value +";" + new Date().toLocaleString() + ";"
        logEventSignal.value = logObject

        // If there is a on click prop call the corresponding function with the provided parameters
        if(lazyProps.onclick){ 
            for(let i in lazyProps.onclick){
                console.log(lazyProps.onclick[i])
            }

            handleMapFunctions(scriptsMap, lazyProps.onclick)
        }     
    } 

    if(commsMessageSignal.value && commsMessageSignal.value.topic==="commands"){
        console.log("commsMessageSignal")
        console.log(commsMessageSignal.value)

        runNumber = commsMessageSignal.value.message.runNumber
        SetExperimentStartTimestampExternal(commsMessageSignal.value.message.startTimestamp)
        if(commsMessageSignal.value.message.experimentStarted){
            buttonOnClick()
        }
    }

    let buttonClassString =  "bg-sky-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded m-1"
    
    const stationButtons = lazyProps.operatorStationObjects.map((stationObject:any, index:number) => {
        let selectedClass = ""
        if(stationObject.metaKey === operatorStation.value){
            selectedClass = " ring-2 ring-blue-900"
        }
        return (
            <button type="button" className={buttonClassString+selectedClass+" row-start-2 col-start-"+(index+1)} onClick={() => onStationButtonClick(stationObject.metaKey)}>
                {stationObject.label}
            </button>
        )
    })

    let runNumberLabel:any = <p className="row-start-1">Run number: </p>
    let runNumberInput:any = <TextEntry lazyProps={{ClassName:"row-start-1 col-start-2 col-span-1 resize-none", 
        DefaultValue:"1",EntryFieldOptions:[1,1]}}/>
    let startButton:any =   <button type="button" className={buttonClassString+" row-start-3 col-start-2"} 
                            onClick={buttonOnClick}>{lazyProps.label}
                                Start
                        </button>   

    if(lazyProps.runNumberInput === false){
        runNumberLabel = null
        runNumberInput = null
        startButton = null
    }

    return (
        <>
        <p className="text-3xl mb-20">Experiment landing page</p>
        <div className="grid grid-cols-3 grid-rows-3 gap-8">
            {runNumberLabel}{runNumberInput}
            {stationButtons}
            {startButton}   
        </div>
        </>
    )
}

export default ExperimentMetaStart