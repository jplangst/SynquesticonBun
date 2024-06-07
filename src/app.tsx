import { signal } from "@preact/signals"

import ModuleRenderComponent from "./ModuleRenderComponent";
import { fetchExperiment, fetchData } from "./Utils/Utils";

// Get any parameters encoded in the url
const queryParameters = new URLSearchParams(window.location.search)
const experimentName = queryParameters.get("exp") //Extract the experiment name

// Load the experiment json file on start
const experimentDataSignal = signal(null)
await fetchExperiment(experimentDataSignal, experimentName)
export const experimentObjectSignal = signal(null)

if(experimentDataSignal.value){
  await fetchData(experimentObjectSignal, experimentDataSignal) 

  //console.log(experimentObjectSignal.value)
  //if(experimentDataSignal.value && experimentDataSignal.value.communicationMethod){
      //comms.connect(experimentData.communicationMethod)
  //}
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
