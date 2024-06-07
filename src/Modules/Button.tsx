import type { ReactElement} from "react";
import { useSignal} from "@preact/signals"

import { experimentObjectSignal } from "../app";
import { handleMapFunctions } from "../Utils/Utils";

type Props = {
    lazyProps : any,
};

//let startTimestamp = Date.now()

export default function Button({lazyProps}: Props): ReactElement {
    const buttonClickClass = useSignal("font-normal")

    if (!experimentObjectSignal.value) {
        return (<></>);
    }

    const buttonOnClick = () => {    
        buttonClickClass.value = " font-bold"

        let scriptsMap:null|Map<string, any> = null
        if(!experimentObjectSignal.value){
            return(<></>)
        }
    
        scriptsMap = (experimentObjectSignal.value as { scriptsMap: Map<string, any> }).scriptsMap;

        //Write log event
        //const absoluteTimestamp = Date.now()
        //const relativeTimestamp = absoluteTimestamp-startTimestamp
        //const event = {absoluteTimestamp:absoluteTimestamp,relativeTimestamp:relativeTimestamp ,taskIndex:lazyProps.taskIndex, eventType:"Button press", payload:lazyProps.label}
        //scriptsMap.get("WriteEvent").default(event)
        
        // If there is a on click prop call the corresponding function with the provided parameters
        if(lazyProps.onclick){ 
            handleMapFunctions(scriptsMap, lazyProps.onclick)
        }     
    } 

    //Combine existing class modifiers with prop provided class modifiers
    let classString = "bg-sky-500 hover:bg-sky-700 text-white py-2 px-4 rounded m-1"+buttonClickClass.value
    if(lazyProps.className){
        classString = classString + " " + lazyProps.className
    }

    return(
        <button type="button" className={classString} 
            onClick={buttonOnClick}>{lazyProps.label}</button>
    );
}