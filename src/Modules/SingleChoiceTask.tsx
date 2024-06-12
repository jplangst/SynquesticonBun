import type { ReactElement } from "react";
import { v4 as uuidv4 } from 'uuid';

type Props = {
    lazyProps : any,
};

export default function SingleChoice({lazyProps}: Props): ReactElement {
    const handleChange = (e:any) => {
        lazyProps.onClick(e, lazyProps.questionLogKey)
    };

    const singleChoiceLabels = lazyProps.choices.split(',');
    const inputName = singleChoiceLabels[0];
    return(
        <>
        <form>
            <div class="flex flex-col"> 
            <p>{lazyProps.questionText}</p>   
            <div class="flex flex-row">
            {         
                singleChoiceLabels.map((choiceLabel:string, choiceIndex:number) => {
                    const labelId = choiceLabel+{choiceIndex}
                    return(
                        <span class="flex flex-col" key={uuidv4()}>      
                            <input onClick={handleChange} type='radio' name={inputName} value={choiceLabel}/>
                            <label htmlFor={labelId}>{choiceLabel}</label> 
                        </span>
                    )
                })    
            }
            </div>
            </div>
        </form>    
        </>
    );
}