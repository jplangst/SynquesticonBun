//External imports
import type {ReactElement} from "react";
import {ChangeEvent} from 'react';
import { useSignal } from "@preact/signals";
import { v4 as uuidv4 } from 'uuid';

// Our imports
import { experimentObjectSignal } from "../app";
import { CommunicationsObject } from "../Communication/communicationModule";

type Props = {
    lazyProps : any,
};

let runNumber = "1"
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
        commsObject.publish(commsObject.commandsTopic, {runNumber:runNumber, experimentStarted:experimentStarted.value, startTimestamp:startOfExperimentTimestamp.toString()})
    }

    // This button press will start and stop the experiment
    // When starting the run number will be broadcast to the connected tablets/phones
    const buttonOnClick = () => {    
        if (!scriptsMap) 
            return
    
        experimentStarted.value = !experimentStarted.value

        broadcastExperimentStartAndStop()

        //Update the metadate for the station
        const updateMetaData = scriptsMap.get(lazyProps.operatorMetaClick.function)
        updateMetaData.default({runNumber:runNumber});  
    } 

    let buttonClassString =  "bg-sky-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded m-1"
    
    const experimentButton = experimentStarted.value ? "Stop Experiment" : "Start Experiment"

    return (
        <>
        <p className="text-3xl mb-20">Master Buzz Experiment Controller</p>
        <div className="grid grid-cols-3 grid-rows-3 gap-20">
            <p className="row-start-1">Run number: </p>
            <TextEntry lazyProps={{ClassName:"row-start-1 col-start-2 col-span-1 resize-none disabled:text-slate-500 disabled:bg-slate-200",DefaultValue:"1",EntryFieldOptions:[1,1], disabled:experimentStarted.value}}/>

            <button type="button" className={buttonClassString+"row-start-3 col-start-2"} 
                onClick={buttonOnClick}>{lazyProps.label}
                {experimentButton}
            </button>      
        </div>
        </>
    )
}

export default MarenMasterBuzz