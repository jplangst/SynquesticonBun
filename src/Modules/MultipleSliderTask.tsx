import type {ReactElement} from "react";
import { v4 as uuidv4 } from 'uuid';
import { useSignal } from "@preact/signals";

import { experimentObjectSignal } from "../app";
import { logEventSignal } from "../ModuleRenderComponent";

type Props = {
    lazyProps : any,
};

import { handleMapFunctions } from "../Utils/Utils";
import SliderTask from "./SliderTask";


export default function MultipleSliderTask({lazyProps}: Props): ReactElement {
    const answerMap = useSignal(new Map<string, any>())

    let scriptsMap:null|Map<string, any> = null
    if(!experimentObjectSignal.value){
        console.log("Experiment object is null")
        return(<></>)
    }
    scriptsMap = (experimentObjectSignal.value as { scriptsMap: Map<string, any> }).scriptsMap;

    const buttonOnClick = () => {    
        if(!scriptsMap){
            console.log("Could not call function. Scripts map is null.")
            return
        }

        //Iterate over the map and log the answers
        for (const [key, value] of answerMap.value.entries()) {
            console.log(key, value);
          
            let logObject = logEventSignal.value
            logObject.header = logObject.header + key + ";"
            logObject.data = logObject.data + value + ";"
            logEventSignal.value = logObject

            //Reset the map
            //answerMap = new Map<string, any>()
        }
        
        // If there is a on click prop call the corresponding function with the provided parameters
        if(lazyProps.onclick){ 
            handleMapFunctions(scriptsMap, lazyProps.onclick)
        }     
    } 

    const onSliderChange = (e: any, questionKey: string) => {
        //Adds or updates the answer map depending on if the key already exists
        answerMap.value.set(questionKey, e.target.value)
    }

    const singleChoiceSliderElements = lazyProps.questions.map((question: any) => {
        //Add the default value to the answer map, this helps keep the order of the answers
        answerMap.value.set(question.questionLogKey, lazyProps.sliderProps.defaultValue)
        //Create the react element for the slider and return it
        const singleChoiceProps = {...question, ...lazyProps.sliderProps, onSliderChange:onSliderChange, mb:"mb-5"}
        return <SliderTask lazyProps={singleChoiceProps}/>
    });

    const title = lazyProps.title ? <p class="font-bold text-2xl mb-6 text-wrap"> {lazyProps.title} </p> : null

    let disabled = false
    const disabledClass = "bg-gray-300 px-4 py-2 rounded-md cursor-not-allowed opacity-50"
    const enabledClass = "bg-sky-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded m-1"
    let buttonClass = disabled ? disabledClass : enabledClass

    return <>
    <div key={uuidv4()} class="w-full flex flex-col items-center overflow-y">
    <div class="w-11/12 relative mb-6 font-bold text-lg overflow-y">
        {title}
        {singleChoiceSliderElements}
        <span class="text-lg text-gray-500 dark:text-gray-400 absolute start-0 -bottom-6">{lazyProps.lowSliderText}</span>
        <span class="text-lg text-gray-500 dark:text-gray-400 absolute end-0 -bottom-6">{lazyProps.highSliderText}</span>  
    </div>
    <button type="button" disabled={disabled} className={buttonClass} onClick={buttonOnClick}>
            {lazyProps.buttonLabel}
    </button>
    </div>
    </>
}
