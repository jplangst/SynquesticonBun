import type {ReactElement} from "react";
import {useEffect} from 'react';
//import {ChangeEvent} from 'react';
import { v4 as uuidv4 } from 'uuid';

import { experimentObjectSignal } from "../app";
import { logEventSignal, metaDataSignal } from "../ModuleRenderComponent";

type Props = {
    lazyProps : any,
};

import { handleMapFunctions } from "../Utils/Utils";

export default function Slider({lazyProps}: Props): ReactElement {
    let scriptsMap:null|Map<string, any> = null
    if(!experimentObjectSignal.value){
        console.log("Experiment object is null")
        return(<></>)
    }
    scriptsMap = (experimentObjectSignal.value as { scriptsMap: Map<string, any> }).scriptsMap;

    // Check if the role conditional is set and if the current role matches the conditional
    useEffect(() => {
        if(lazyProps.roleConditional && lazyProps.roleConditional === metaDataSignal.value.role){
            if(lazyProps.onclick){ 
                //Update the log object
                let logObject = logEventSignal.value
                logObject.header = logObject.header + lazyProps.questionLogKey+";"
                logObject.data = logObject.data + -1 + ";"

                handleMapFunctions(scriptsMap, lazyProps.onclick)
            }    
        }
    },[])
    
    //NB these values can be moved to the experiment config if more flexibility is needed
    const minValue = 0
    const maxValue = 100
    const step = 5
    const defaultValue = 50

    let sliderValue = defaultValue

    let tickMarkData = Array.from(
        { length: Math.ceil((maxValue + step - minValue) / step) },
        (_, i) => i * step
    );
    
    tickMarkData = tickMarkData.map((value) => value/maxValue)
    
    const tickMarks = tickMarkData.map( (_, index) =>{
        let positionString = ""
        if (index == 0){
            positionString = "text-left"
        }
        else if (index == tickMarkData.length-1){
            positionString = "text-right"
        }
        else{
            positionString = "text-center"
        }

        const classString = "text-gray-500 dark:text-gray-400 " + positionString
        return <span class={classString}>|</span>
    })

    const onSliderChange = (e: any) => {
        sliderValue = e.target.value
    }

    const buttonOnClick = () => {    
        if(!scriptsMap){
            console.log("Could not call function. Scripts map is null.")
            return
        }

        //Update the log object
        let logObject = logEventSignal.value
        logObject.header = logObject.header + lazyProps.questionLogKey+";"
        logObject.data = logObject.data + sliderValue + ";"
        
        // If there is a on click prop call the corresponding function with the provided parameters
        if(lazyProps.onclick){ 
            handleMapFunctions(scriptsMap, lazyProps.onclick)
        }     
    } 

    return <>
    <div key={uuidv4()} class="w-full flex flex-col items-center">
    <div class="w-9/12 relative mb-6 w-">
        <p class="font-bold">{lazyProps.title}</p>
        <label for="labels-range-input"  class="block mb-2 text-sm font-medium text-gray-900 dark:text-black" 
            dangerouslySetInnerHTML={{ __html: lazyProps.questionText}} />
        <input id="labels-range-input"  type="range" value={defaultValue} min={minValue} max={maxValue} 
            step={step} class="w-full h-3 bg-gray-200  appearance-none cursor-pointer  dark:bg-gray-700" 
            onChange={onSliderChange}/>
        <div class="px-1 flex justify-between mt-0 text-xs text-gray-600">{tickMarks}</div>
        <span class="text-sm text-gray-500 dark:text-gray-400 absolute start-0 -bottom-6">{lazyProps.lowSliderText}</span>
        <span class="text-sm text-gray-500 dark:text-gray-400 absolute end-0 -bottom-6">{lazyProps.highSliderText}</span>
        
    </div>
    <button type="button" className="w-1/4 bg-sky-500 hover:bg-sky-700 text-white py-2 px-4 rounded m-1" 
            onClick={buttonOnClick}>{lazyProps.buttonLabel}</button>
    </div>
    </>
}
