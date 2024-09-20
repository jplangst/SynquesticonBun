import { signal } from "@preact/signals"

import ModuleRenderComponent from "./ModuleRenderComponent";
import { fetchExperiment, fetchData } from "./Utils/Utils";
import { CommunicationsObject } from "./Communication/communicationModule";
import { roleSignal } from "./SignalStore";

//TODO due to safety reasons it is not possible to auto enter fullscreen. Could add a module that only 
//  has a fullscreen button that goes fullscreen and then moves to next task...

//TODO make it so that you can create a set of experiments, e.g. 
//    experiments:[MarenBuzz(from json), CodeModule:download and clear (from the file itself), 
//                 MarenQuestionnaire(fromjson), CodeModule:download and clear (from the file itself)]

// Get any parameters encoded in the url
const queryParameters = new URLSearchParams(window.location.search)
const experimentName = queryParameters.get("exp") //Extract the experiment name
let host:string|null = queryParameters.get("host")
let port:string|number|null = queryParameters.get("port")


//export const roleSignal = signal(queryParameters.get("role")) //Extract the role from the url if it exists
roleSignal.value = queryParameters.get("role")

export const skipSignal = signal<string|boolean|null>(queryParameters.get("skip")) //Signal to skip the current module
// Load the experiment json file on start
export const experimentDataSignal = signal(null)
await fetchExperiment(experimentDataSignal, experimentName)
export const experimentObjectSignal = signal(null)

if(experimentDataSignal.value){
  await fetchData(experimentObjectSignal, experimentDataSignal) 

  // Connect to the communication method given in the experiment data
  if(experimentDataSignal.value){
    let communicationMethod = (experimentDataSignal.value as { communicationMethod: any }).communicationMethod;

    // If the host was not provided in the url
    if(!host){
      // Check the experiment file
      if(!communicationMethod.host){
        host = "10.212.65.113"
      }
      else{
        host = communicationMethod.host
      }
    }

    // If the host was not provided in the url
    if(!port){
      // Check the experiment file
      if(!communicationMethod.port){
        port = 8080
      }
      else{
        port = communicationMethod.port
      }
    }

    communicationMethod.port = port 
    communicationMethod.host = host

    await CommunicationsObject.value.connect(communicationMethod)

    console.log(communicationMethod.mqttTopics)
    for(let i in communicationMethod.mqttTopics){
      const mqttTopic = communicationMethod.mqttTopics[i]
      CommunicationsObject.value.subscribe(mqttTopic)
    }
  }
}

export function App() {
  return (
    <>
      <div class="h-svh w-svw m-0 p-0 select-none fixed overflow-hidden bg-sky-500">
        <ModuleRenderComponent experimentObject={experimentObjectSignal.value}/>
      </div>
    </>
  )
}
