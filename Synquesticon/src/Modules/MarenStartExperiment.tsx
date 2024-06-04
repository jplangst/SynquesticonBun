//External imports
import type {ReactElement} from "react";
import {ChangeEvent} from 'react';
import { signal, batch } from "@preact/signals";
import { v4 as uuidv4 } from 'uuid';

// Our imports
import { experimentObjectSignal } from "../app";
import { handleMapFunctions } from "../Utils/Utils";

const runNumber = signal(0)
const operatorStation = signal("")

type Props = {
    lazyProps : any,
};

function TextEntry({lazyProps}: Props): ReactElement {
    //const defaultTextValue = lazyProps.DefaultValue;
    let textFieldSize = lazyProps.EntryFieldOptions; 
    const onChange = (e: ChangeEvent<HTMLTextAreaElement>)=> {
        if(e.target){
            runNumber.value= e.target.value
        }
    }

    return <span className={lazyProps.ClassName} key={uuidv4()}><textarea  placeholder={runNumber.value.toString()} rows={textFieldSize[1]} cols={textFieldSize[0]} onChange={onChange}></textarea></span>
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

    scriptsMap = experimentObjectSignal.value.scriptsMap
    
    const buttonOnClick = () => {    
        if (!scriptsMap) 
            return
    
        //Update the metadate for the station
        const updateMetaData = scriptsMap.get(lazyProps.operatorMetaClick.function)
        updateMetaData.default(runNumber.value, operatorStation.value);

        // If there is a on click prop call the corresponding function with the provided parameters
        if(lazyProps.onclick){ 
            handleMapFunctions(scriptsMap, lazyProps.onclick)
        }     
    } 

    let buttonClassString = "bg-sky-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded m-1"
    
    const stationButtons = lazyProps.operatorStationLabels.map((label:string) => {
        let selectedClass = ""
        if(label === operatorStation.value){
            selectedClass = " ring-2 ring-blue-900"
        }
        return (
            <button type="button" className={buttonClassString+selectedClass} onClick={() => onStationButtonClick(label)}>
                {label}
            </button>
        )
    })

    return (
        <>
        <div className="grid grid-cols-3 grid-rows-3 gap-20">
            <p>Run number: </p>
            <TextEntry lazyProps={{ClassName:"col-span-2", DefaultValue:"0",EntryFieldOptions:[10,2]}}/>

            {stationButtons}

            <button type="button" className={buttonClassString+" col-start-2"} 
                onClick={buttonOnClick}>{lazyProps.label}
                Start Experiment
            </button>      
        </div>
        </>
    )
}

export default MarenStartExperiment