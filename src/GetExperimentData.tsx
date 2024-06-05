import { lazy } from 'react'
import { v4 as uuidv4 } from 'uuid';

async function loadScriptFromFile(dynamicScriptPromises:any, elementModules:any, elementModule:any){
    console.log(`./Scripts/${elementModule}.tsx`)
    const dynamicScriptPromise = import(`./Scripts/${elementModule}.tsx`)
    dynamicScriptPromises.push(dynamicScriptPromise)
    elementModules.push(elementModule)
}

async function parseModules(tasks:any, taskIndex:number, dynamicScriptsMap:any, moduleMap:any, codeModulesMap:any){ 
    const renderModules:any = [] 

    let dynamicScriptPromises:any = []
    let elementModules:any = []

    //Create the lookup map with all scripts and modules required
    tasks.forEach(async (element:any) =>{
        // Adds new component modules and scripts to lookup maps
        if (!moduleMap.has(element.module) || !dynamicScriptsMap.has(element.module)){
            if(element.type == "COMPONENT"){
                let importedModule = lazy( () => import(`./Modules/${element.module}.tsx`))
                moduleMap.set(element.module, importedModule)

                let functions = element.props.onclick
                if(functions){
                    if (Array.isArray(functions)){
                        for(let i = 0; i < functions.length; i++){
                            const singleFunction = functions[i]
                            if(!dynamicScriptsMap.has(singleFunction.function)){
                                console.log()
                                loadScriptFromFile(dynamicScriptPromises, elementModules, singleFunction.function)
                            }
                        }
                    }
                    else{
                        if(!dynamicScriptsMap.has(functions.function)){
                            loadScriptFromFile(dynamicScriptPromises, elementModules, functions.function)
                        }
                    }
                }
                
            }
            else if(element.type == "CODE"){ 
                try{
                    //const dynamicScriptPromise = import(`./Scripts/${element.module}.tsx`)
                    //dynamicScriptPromises.push(dynamicScriptPromise)
                    //elementModules.push(element.module)
                    console.log(element.module)
                    loadScriptFromFile(dynamicScriptPromises, elementModules, element.module)
                }
                catch(e){
                    //This particular error is expected as the SetTaskIndex module is injected via code
                    console.log("Failed to load script dynamically:"+element.module)
                }
            }
        } 
    })

    //Resolve any promises that are not resolved yet
    dynamicScriptPromises = await Promise.all(dynamicScriptPromises)

    //Add the resolved promises to the map
    for (let i = 0; i < dynamicScriptPromises.length; i++){
        dynamicScriptsMap.set(elementModules[i], dynamicScriptPromises[i])
    }

    // Creates render component modules using the map, passing props from the json file in the process// Create the experiment object
    tasks.forEach(async (element:any) =>{   
        if(element.type == "COMPONENT"){
            element.props.taskIndex = taskIndex;
            const Component = moduleMap.get(element.module);
            renderModules.push(<Component key={uuidv4()} lazyProps={element.props} />)         
        }
        else if(element.type == "CODE"){ //Adds the code module to the code modules map which is used to get and call functions with props from the json file
            //If the element already exist in the map we get it and append to it
            if(codeModulesMap.has(taskIndex)){
                let existingEntry = codeModulesMap.get(taskIndex)
                existingEntry.push({module:element.module,props:element.props})
                codeModulesMap.set(taskIndex,existingEntry)
            }
            else{ //Otherwise we add a new entry to the map
                codeModulesMap.set(taskIndex,[{module:element.module,props:element.props}])
            }   
        }
        else{
            console.log("Unknown module type:"+element.type)
            return
        }        
    })

    console.log(renderModules)

    return renderModules
}

// Takes a list of tasks and for each task creates a react element.
export default async function getExperimentData(jsonTaskList:any){
    const moduleMap = new Map()
    const dynamicScriptsMap = new Map()
    let codeModulesMap = new Map()

    let componentModules:any = <div>No tasks provided or error loading the tasks</div>; 
    console.log(jsonTaskList)
    if(jsonTaskList){
        componentModules = ( jsonTaskList.map(async (tasks:any, taskListIndex:number) => {
            return(
                await parseModules(tasks, taskListIndex, dynamicScriptsMap, moduleMap, codeModulesMap)
            )
        }));

        componentModules = await Promise.all(componentModules)
    }

    return [dynamicScriptsMap, codeModulesMap, componentModules]
}
