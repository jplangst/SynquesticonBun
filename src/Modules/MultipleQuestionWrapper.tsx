import type {ReactElement} from "react";
import {useEffect, useRef} from 'react';
import { useSignal } from "@preact/signals"
import { v4 as uuidv4 } from 'uuid';
import { FunctionalComponent } from 'preact';

import { useState, useCallback } from 'preact/hooks';

import { experimentObjectSignal, skipSignal} from "../app";
import { logEventSignal, metaDataSignal} from "../ModuleRenderComponent";

type Props = {
    lazyProps : any,
};

type ModuleName = keyof typeof componentMap;

interface ComponentSpec {
  module: ModuleName;
  props: Record<string, any>; // Or something more specific
}

import { handleMapFunctions } from "../Utils/Utils";
import Button from "./Button";
import Slider from "./SliderTask";

//TODO extend this to add more module support later. Ideally it should be lazy loaded as the other things
const componentMap = {
  "SliderTask": Slider,
} satisfies Record<string, FunctionalComponent<any>>;

// TODO Add a way to get the answer from the child questions
// TODO add a way to check if all questions have been answered
// TODO write to the event log object when clicking the answer button (See slider module)
export default function MultipleQuestionWrapper({lazyProps}: Props): ReactElement {
    //const [answers, setAnswers] = useState<Map<string, object>>(new Map());

    const [answers, setAnswers] = useState<Map<string, number>>(() => {
    return new Map(
        lazyProps.childQuestions.map((child: any) => [child.props.questionLogKey, -1])
    );
    });

    // Memoize to avoid unnecessary re-renders
    const handleChildResponse = useCallback((childId: string, payload: object) => {
        console.log(childId)
        console.log(payload)

        setAnswers(prev => {
            const newMap = new Map(prev);
            newMap.set(childId, payload.Value);

            const isComplete = [...newMap.values()].every(value => value !== -1);
            if (isComplete){
                onButtonActivate()
            }

            return newMap;
        });


    }, []);

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
        buttonDisabled.value = true

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
                //Update the log object with the data from all the child questions
                let logObject = logEventSignal.value[lazyProps.questionnaireKey]

                if (logObject) {
                    // Key exists, update the data
                    answers.forEach((value, key) => {
                        logObject.header = logObject.header + key+";" 
                        logObject.data = logObject.data + -1 + ";"
                        logObject.questionnaireKey = lazyProps.questionnaireKey
                    });
                    logEventSignal.value[lazyProps.questionnaireKey] = logObject
                } else {
                    let newLogObject = {
                        header:"",
                        data:"",
                        questionnaireKey: lazyProps.questionnaireKey
                    }
                    answers.forEach((value, key) => {
                        newLogObject.header = newLogObject.header + key+";" 
                        newLogObject.data = newLogObject.data + -1 + ";"
                        newLogObject.questionnaireKey = lazyProps.questionnaireKey
                    });

                    logEventSignal.value = {
                        ...logEventSignal.value,
                        [newLogObject.questionnaireKey]: newLogObject
                    };
                }

                handleMapFunctions(scriptsMap, lazyProps.onclick)
            }  
        }

        return () => {
        };
    },[])

    const onButtonActivate = () => {
        buttonDisabled.value = false
    }

    const buttonOnClick = () => {    
        if(!scriptsMap){
            console.log("Could not call function. Scripts map is null.")
            return
        }


        //Update the log object with the data from all the child questions
        let logObject = logEventSignal.value[lazyProps.questionnaireKey]

        if (logObject) {
            // Key exists, update the data
            answers.forEach((value, key) => {
                logObject.header = logObject.header + key+";" 
                logObject.data = logObject.data + value + ";"
                logObject.questionnaireKey = lazyProps.questionnaireKey
            });
            logEventSignal.value[lazyProps.questionnaireKey] = logObject
        } else {
            let newLogObject = {
                header:"",
                data:"",
                questionnaireKey: lazyProps.questionnaireKey
            }
            answers.forEach((value, key) => {
                newLogObject.header = newLogObject.header + key+";" 
                newLogObject.data = newLogObject.data + value + ";"
                newLogObject.questionnaireKey = lazyProps.questionnaireKey
            });

            logEventSignal.value = {
                ...logEventSignal.value,
                [newLogObject.questionnaireKey]: newLogObject
            };
        }

        // Reset the map just in case
        setAnswers(new Map())
    
        // If there is a on click prop call the corresponding function with the provided parameters
        if(lazyProps.onclick){ 
            handleMapFunctions(scriptsMap, lazyProps.onclick)
        }     
    } 

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

    //TODO create a list of the child questions to render here
    console.log(lazyProps.childQuestions)
    const childQuestions = lazyProps.childQuestions.map((item:ComponentSpec, index:number) => {
        const Component = componentMap[item.module];

        if (!Component) {
          console.warn(`Module ${item.module} not found in componentMap.`);
          return null;
        }

        //TODO inject the callback here
        // Optional: Process or modify props here
        const processedProps = {
          ...item.props,
          onAnswer: (data: object) =>
            handleChildResponse(item.props.questionLogKey, data)
        };

        const key = item.props.questionLogKey+"Wrapper"
        return <Component key={key} lazyProps={processedProps} />;
      })

    return <>
    <div key={lazyProps.childQuestions[0].props.questionLogKey+"Container"} class={"w-full flex flex-col items-center " + lazyProps.mb}>
            {childQuestions}
        {answerButton}
    </div>
    </>
}