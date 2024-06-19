import { signal } from "@preact/signals"

import ModuleRenderComponent from "./ModuleRenderComponent";
import { fetchExperiment, fetchData } from "./Utils/Utils";
import { CommunicationsObject } from "./Communication/communicationModule";

//TODO setup so that the timestamp can be synced using the master clock 

// Get any parameters encoded in the url
const queryParameters = new URLSearchParams(window.location.search)
const experimentName = queryParameters.get("exp") //Extract the experiment name
//TODO add mqtt ip address to the url parameters
//TODO use the role signal for the questionnaire as well? Can also use the run number. If they can answer on the phone the buzz and questionnaire can be chained.
export const roleSignal = signal(queryParameters.get("role")) //Extract the role from the url if it exists
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
