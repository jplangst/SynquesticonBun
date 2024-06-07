//External imports
import type {ReactElement} from "react";
import {ChangeEvent} from 'react';
import { signal } from "@preact/signals";
import { v4 as uuidv4 } from 'uuid';

// Our imports
import {logEventSignal} from "../ModuleRenderComponent";

import { experimentObjectSignal } from "../app";
import { handleMapFunctions } from "../Utils/Utils";

const runNumber = signal("1")
const operatorStation = signal("")

type Props = {
    lazyProps : any,
};

let rowNumber = "1"
function TextEntry({lazyProps}: Props): ReactElement {
    //const defaultTextValue = lazyProps.DefaultValue;
    let textFieldSize = lazyProps.EntryFieldOptions; 
    const onChange = (e: ChangeEvent<HTMLTextAreaElement>)=> {
        const target = e.target as HTMLTextAreaElement
        if(target){
            //runNumber.value= target.value
            rowNumber = target.value
        }
    }
    //{runNumber.value.toString()}
    return <textarea autofocus className={lazyProps.ClassName} value={rowNumber} placeholder={lazyProps.DefaultValue} key={uuidv4()} rows={textFieldSize[1]} cols={textFieldSize[1]} onChange={onChange} />
}

// Called when any of the buttons are pressed
const onStationButtonClick = (response:string) => {
     operatorStation.value = response
}

function MarenStartExperiment({lazyProps}: Props):ReactElement {
    let scriptsMap:null|Map<string, any> = null
    if(!experimentObjectSignal.value){
        return(<></>)
    }

    scriptsMap = (experimentObjectSignal.value as { scriptsMap: Map<string, any> }).scriptsMap;
    //scriptsMap = experimentObjectSignal.value.scriptsMap
    
    const buttonOnClick = () => {    
        if (!scriptsMap) 
            return
    
        //Update the metadate for the station
        const updateMetaData = scriptsMap.get(lazyProps.operatorMetaClick.function)
        updateMetaData.default({runNumber:runNumber.value, role:operatorStation.value});

        // Add the run number and operator role to the log
        let logObject = logEventSignal.value
        logObject.header = logObject.header + "Run Number;Operator Role;"
        logObject.data = logObject.data + runNumber.value + ";" + operatorStation.value +";"
        logEventSignal.value = logObject

        // If there is a on click prop call the corresponding function with the provided parameters
        if(lazyProps.onclick){ 
            handleMapFunctions(scriptsMap, lazyProps.onclick)
        }     
    } 

    let buttonClassString =  "bg-sky-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded m-1"
    
    const stationButtons = lazyProps.operatorStationLabels.map((label:string, index:number) => {
        let selectedClass = ""
        if(label === operatorStation.value){
            selectedClass = " ring-2 ring-blue-900"
        }
        return (
            <button type="button" className={buttonClassString+selectedClass+" row-start-2 col-start-"+(index+1)} onClick={() => onStationButtonClick(label)}>
                {label}
            </button>
        )
    })

    return (
        <>
        <div className="grid grid-cols-3 grid-rows-3 gap-20">
            <p className="row-start-1">Run number: </p>
            <TextEntry lazyProps={{ClassName:"row-start-1 col-start-2 col-span-1 resize-none", DefaultValue:"1",EntryFieldOptions:[1,1]}}/>

            {stationButtons}

            <button type="button" className={buttonClassString+"row-start-3 col-start-2"} 
                onClick={buttonOnClick}>{lazyProps.label}
                Start Experiment
            </button>      
        </div>
        </>
    )
}

export default MarenStartExperiment