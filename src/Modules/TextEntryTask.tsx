import type { ReactElement } from "react";
import {ChangeEvent} from 'react';
import { v4 as uuidv4 } from 'uuid';

type Props = {
    lazyProps : any,
};

export default function TextEntry({lazyProps}: Props): ReactElement {
    const defaultTextValue = lazyProps.DefaultValue;
    let textFieldSize = lazyProps.EntryFieldOptions; // NB the text field size is not used now.
    const onChange = (e: ChangeEvent<HTMLTextAreaElement>)=> {
        const target = e.target as HTMLTextAreaElement

        if(target && lazyProps.onChange){
            lazyProps.onChange(target.value, lazyProps.eventId)
        }
        //addToLogObject("Text entry", lazyProps.taskIndex, e.target.value)
        // if(target){
        //     console.log(target.value)
        // }
    }

    return <textarea disabled={lazyProps.disabled} key={lazyProps.eventId} placeholder={defaultTextValue}  rows={textFieldSize[1]} cols={textFieldSize[0]} onChange={onChange}></textarea>
}