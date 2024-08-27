import type {ReactElement} from "react";
import {useEffect, useRef} from 'react';
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
    const rangeRef = useRef<HTMLInputElement>(null);

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
        const handleTouchStart = (e: TouchEvent) => {
            e.preventDefault(); // Prevents the default action to make sure it works on the first touch
            if (rangeRef.current) {
                const rect = rangeRef.current.getBoundingClientRect();
                const touch = e.touches[0];
                const touchX = touch.clientX - rect.left;
                const value = (touchX / rect.width) * (parseFloat(rangeRef.current.max) - parseFloat(rangeRef.current.min)) + parseFloat(rangeRef.current.min);

                console.log("Calculated value: " + value)

                rangeRef.current.value = value.toString();
                const changeEvent = new Event('input', { bubbles: false });
                rangeRef.current.dispatchEvent(changeEvent);
                //rangeRef.current.focus();
            }
        };

        const rangeElement = rangeRef.current;
        if (rangeElement) {
            rangeElement.addEventListener('touchstart', handleTouchStart);
        }

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

        return () => {
            if (rangeElement) {
                rangeElement.removeEventListener('touchstart', handleTouchStart);
            }
        };
    },[])
    
    //Default to 0 -> 100 unless configured otherwise.
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
        e.preventDefault();
        if(lazyProps.onSliderChange){
            lazyProps.onSliderChange(e, lazyProps.questionLogKey)
        }    

        if(e.target.value){
            sliderValue = e.target.value
        } 
    }

    const onButtonActivate = (e: any) => {
        if(e.target.value){
            buttonDisabled.value = false
        } 
    }

    const buttonOnClick = () => {    
        if(!scriptsMap){
            console.log("Could not call function. Scripts map is null.")
            return
        }

        //Update the log object
        if(rangeRef.current){
            sliderValue = Number(rangeRef.current.value)
        }

        console.log("Recorded slider value: ", sliderValue)
        
        let logObject = logEventSignal.value
        logObject.header = logObject.header + lazyProps.questionLogKey+";"
        logObject.data = logObject.data + sliderValue + ";"
    
        // If there is a on click prop call the corresponding function with the provided parameters
        if(lazyProps.onclick){ 
            handleMapFunctions(scriptsMap, lazyProps.onclick)
        }     
    } 

    const title = lazyProps.title ? <p class="select-none text-wrap font-bold mb-6 text-2xl"> {lazyProps.title} </p> : null

    const disabledClass = "bg-gray-300 px-4 py-2 rounded-md cursor-not-allowed opacity-50 m-1"
    const enabledClass = "bg-sky-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded m-1"
    let buttonClass = buttonDisabled.value ? disabledClass : enabledClass
    const buttonProps = {
        onClickCallback: buttonOnClick,
        className: " "+buttonClass,
        label: lazyProps.buttonLabel,
        buttonDisabled: buttonDisabled.value
    }

    const answerButton = lazyProps.buttonLabel ? <Button lazyProps={buttonProps}/> : null

    const sliderClass = buttonDisabled.value==true? "slider" : ""

    return <>
    <div key={uuidv4()} class={"w-full flex flex-col items-center " + lazyProps.mb}>
    <div class={"w-11/12 relative mb-10 "+sliderClass}>
        {title}
            <label for="labels-range-input"  class="block mb-2 text-xl text-wrap font-medium text-gray-900 dark:text-black" 
                dangerouslySetInnerHTML={{ __html: lazyProps.questionText}} disabled={true}/>
            <input ref={rangeRef} onInput={onSliderChange} onTouchEnd={onButtonActivate} onMouseUp={onButtonActivate} 
                id="labels-range-input"  type="range" defaultValue={String(sliderValue)} min={minValue} max={maxValue} 
                step={step} class="w-full h-5 bg-gray-200 appearance-none dark:bg-gray-700 mb-0 mt-0 select-none" 
                />
        <div class="px-1 flex justify-between mt-0 text-xxs text-gray-600">{tickMarks}</div>
        <span class="text-sm text-gray-500 dark:text-gray-400 absolute start-0 -bottom-6">{lazyProps.lowSliderText}</span>
        <span class="text-sm text-gray-500 dark:text-gray-400 absolute end-0 -bottom-6">{lazyProps.highSliderText}</span>  
    </div>
    {answerButton}
    </div>
    </>
}