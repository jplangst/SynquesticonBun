import {useEffect} from 'react';
import type { ReactElement } from "react";
import {experimentObjectSignal, skipSignal} from "../app";
import { handleMapFunctions } from "../Utils/Utils";

type Props = {
    lazyProps : any,
};
export default function TextItem({lazyProps}:Props): ReactElement {
    let scriptsMap:null|Map<string, any> = null
    if(!experimentObjectSignal.value){
        console.log("Experiment object is null")
        return(<></>)
    }
    scriptsMap = (experimentObjectSignal.value as { scriptsMap: Map<string, any> }).scriptsMap;

    //TODO should refactor/move this utility function somewhere it can be reused. NB Also duplicated in SliderTask atm....
    // Check if the role conditional is set and if the current role matches the conditional
    useEffect(() => { 
        //Check if the current module should be skipped
        console.log(skipSignal.value)
        console.log(lazyProps.skipValue)
        let shouldSkip = false
        if(lazyProps.skipValue && skipSignal.value && lazyProps.skipValue === skipSignal.value){
            shouldSkip = true
        }
        if(shouldSkip){
            if(lazyProps.onclick){             
                handleMapFunctions(scriptsMap, lazyProps.onclick)
            }  
        }
    },[])

    return(
        <div class="mx-5 relative mt-10 mb-10">
            <span className={"w-full text-wrap text-wrap relative text-wrap text-xl font-medium" + lazyProps.classString} dangerouslySetInnerHTML={{ __html: lazyProps.label}}/>
        </div>
    );
}