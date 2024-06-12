import type {ReactElement} from "react";
import {useEffect} from 'react';
//import {ChangeEvent} from 'react';
import { v4 as uuidv4 } from 'uuid';

import { experimentObjectSignal } from "../app";
import { logEventSignal, metaDataSignal } from "../ModuleRenderComponent";

//NB currently not used

type Props = {
    lazyProps : any,
};

import { handleMapFunctions } from "../Utils/Utils";
import SingleChoiceTask from "./SingleChoiceTask";

let selectedValue = 0
export default function MarenSingleChoice({lazyProps}: Props): ReactElement {
    let scriptsMap:null|Map<string, any> = null
    if(!experimentObjectSignal.value){
        return(<></>)
    }

    scriptsMap = (experimentObjectSignal.value as { scriptsMap: Map<string, any> }).scriptsMap;

    const onSelectionChange = (e: any, questionKey: string) => {
        selectedValue = e.target.value
        console.log(selectedValue, questionKey)
    }

    //TODO enforce selections on all questions before button becomes available
    const buttonOnClick = () => {    
        if(!scriptsMap){
            console.log("Could not call function. Scripts map is null.")
            return
        }

        //Update the log object
        //let logObject = logEventSignal.value
        //logObject.header = logObject.header + lazyProps.questionLogKey+";"
        //logObject.data = logObject.data + sliderValue + ";"
        
        // If there is a on click prop call the corresponding function with the provided parameters
        if(lazyProps.onclick){ 
            handleMapFunctions(scriptsMap, lazyProps.onclick)
        }     
    } 

    const singleChoiceElements = lazyProps.questions.map((question: any) => {
        const singleChoiceProps = {...question, choices:lazyProps.choices, onClick:onSelectionChange}
        return <SingleChoiceTask lazyProps={singleChoiceProps}/>
    });

    let disabled = false
    const disabledClass = "bg-gray-300 px-4 py-2 rounded-md cursor-not-allowed opacity-50"
    const enabledClass = "bg-sky-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded m-1"
    let buttonClass = disabled ? disabledClass : enabledClass

    return <>
    <p class="font-bold mb-4">{lazyProps.title}</p>
    <div key={uuidv4()} class="w-full flex flex-col items-center">
            <div class="flex flex-col">
                {singleChoiceElements}
            </div>
        <div class="w-9/12 relative mb-6">
            <span class="text-sm text-gray-500 dark:text-gray-400 absolute start-0 -bottom-6">{lazyProps.leftChoiceText}</span>
            <span class="text-sm text-gray-500 dark:text-gray-400 absolute end-0 -bottom-6">{lazyProps.rightChoiceText}</span>   
        </div>
        <button type="button" disabled={disabled} className={buttonClass} onClick={buttonOnClick}>
            {lazyProps.buttonLabel}
        </button>
    </div>
    </>
}
