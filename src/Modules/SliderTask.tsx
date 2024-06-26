import type {ReactElement} from "react";
import {useEffect} from 'react';
import { useSignal } from "@preact/signals"
import { v4 as uuidv4 } from 'uuid';

import { experimentObjectSignal, skipSignal} from "../app";
import { logEventSignal, metaDataSignal} from "../ModuleRenderComponent";
import "./SliderTask.css";

type Props = {
    lazyProps : any,
};

import { handleMapFunctions } from "../Utils/Utils";
import Button from "./Button";

let sliderValue = -1

export default function Slider({lazyProps}: Props): ReactElement {
    const buttonDisabled = useSignal(true)

    let scriptsMap:null|Map<string, any> = null
    if(!experimentObjectSignal.value){
        console.log("Experiment object is null")
        return(<></>)
    }
    scriptsMap = (experimentObjectSignal.value as { scriptsMap: Map<string, any> }).scriptsMap;

    // Check if the role conditional is set and if the current role matches the conditional
    // If it does write to log and move to the next task
    useEffect(() => { 
        //Check if the current module should be skipped
        let shouldSkip = false
        if(lazyProps.roleConditional && lazyProps.roleConditional === metaDataSignal.value.role){
            shouldSkip = true
        }
        else if(lazyProps.skipValue && skipSignal.value && lazyProps.skipValue === skipSignal.value){
            shouldSkip = true
        }

        if(shouldSkip){
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
    const minValue = lazyProps.minValue ? lazyProps.minValue : 0
    const maxValue = lazyProps.maxValue ? lazyProps.maxValue : 100
    const step = lazyProps.step ? lazyProps.step : 5

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

        const classString = "text-black-500 dark:text-white-400 text-lg font-bold" + positionString

        const tickSymbol = lazyProps.displayTickNumbers ? index+1 : "|"
        return <div class={classString}>{tickSymbol}</div>
    })

    const onSliderChange = (e: any) => {
        if(lazyProps.onSliderChange){
            lazyProps.onSliderChange(e, lazyProps.questionLogKey)
        }    

        sliderValue = e.target.value

        //if(sliderValue != -1){
        buttonDisabled.value = false
        //}
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

    const title = lazyProps.title ? <p class="text-wrap font-bold mb-6 text-2xl"> {lazyProps.title} </p> : null

    const disabledClass = "bg-gray-300 px-4 py-2 rounded-md cursor-not-allowed opacity-50"
    const enabledClass = "bg-sky-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded m-1"
    let buttonClass = buttonDisabled.value ? disabledClass : enabledClass

    const buttonProps = {
        onClickCallback: buttonOnClick,
        className: "w-1/4 "+buttonClass,
        label: lazyProps.buttonLabel,
        buttonDisabled: buttonDisabled.value
    }

    const answerButton = lazyProps.buttonLabel ? <Button lazyProps={buttonProps}/> : null

    const sliderClass = buttonDisabled.value ? "slider" : ""

    return <>
    <div key={uuidv4()} class={"w-full flex flex-col items-center " + lazyProps.mb}>
    <div class={"w-11/12 relative mb-6 "+sliderClass}>
        {title}
        <label for="labels-range-input"  class="block mb-2 text-xl text-wrap font-medium text-gray-900 dark:text-black" 
            dangerouslySetInnerHTML={{ __html: lazyProps.questionText}} />
        <input id="labels-range-input"  type="range" value={sliderValue} min={minValue} max={maxValue} 
            step={step} class="w-full h-3 bg-gray-200  appearance-none cursor-pointer dark:bg-gray-700" 
            onClick={onSliderChange} onTouchEnd={onSliderChange}/>
        <div class="px-1 flex justify-between mt-0 text-xs text-gray-600">{tickMarks}</div>
        <span class="text-sm text-gray-500 dark:text-gray-400 absolute start-0 -bottom-6">{lazyProps.lowSliderText}</span>
        <span class="text-sm text-gray-500 dark:text-gray-400 absolute end-0 -bottom-6">{lazyProps.highSliderText}</span>  
    </div>
    {answerButton}
    </div>
    </>
}
