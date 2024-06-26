import { signal } from "@preact/signals"

import ModuleRenderComponent from "./ModuleRenderComponent";
import { fetchExperiment, fetchData } from "./Utils/Utils";
import { CommunicationsObject } from "./Communication/communicationModule";

//TODO due to safety reasons it is not possible to auto enter fullscreen. Could add a module that only 
//  has a fullscreen button that goes fullscreen and then moves to next task...

//TODO make it so that you can create a set of experiments, e.g. 
//    experiments:[MarenBuzz(from json), CodeModule:download and clear (from the file itself), 
//    MarenQuestionnaire(fromjson), CodeModule:download and clear (from the file itself)]

// Get any parameters encoded in the url
const queryParameters = new URLSearchParams(window.location.search)
const experimentName = queryParameters.get("exp") //Extract the experiment name
//TODO add mqtt ip address to the url parameters (We might use a stiatic IP to the raspberry pie instead)


export const roleSignal = signal(queryParameters.get("role")) //Extract the role from the url if it exists
export const skipSignal = signal(queryParameters.get("skip")) //Signal to skip the current module
// Load the experiment json file on start
export const experimentDataSignal = signal(null)
await fetchExperiment(experimentDataSignal, experimentName)
export const experimentObjectSignal = signal(null)

if(experimentDataSignal.value){
  await fetchData(experimentObjectSignal, experimentDataSignal) 

  // Connect to the communication method given in the experiment data
  if(experimentDataSignal.value){
    let communicationMethod = (experimentDataSignal.value as { communicationMethod: any }).communicationMethod;
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
      <div class="min-h-screen min-v-screen">
        <ModuleRenderComponent experimentObject={experimentObjectSignal.value}/>
      </div>
    </>
  )
}
