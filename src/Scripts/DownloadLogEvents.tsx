import { saveAs } from 'file-saver';
//import { getUUID } from '../Logging/loggingModule';

import { logEventSignal, metaDataSignal } from '../ModuleRenderComponent';
import { v4 as uuidv4 } from 'uuid';
import { CommunicationsObject } from '../Communication/communicationModule';
import { deviceLogUUID } from "../ModuleRenderComponent";

function removeTrailingSeperator(csvString:string) {
    if (csvString[csvString.length-1] === ";") {
        return csvString.slice(0,csvString.length-1);
    }
    return csvString
}

// Downloads the logged events from the browsers local storage
// Should be triggered at the end of an experiment
export default function DownloadLogEvents(logSource:string){
    if(logSource === "localStorage"){
        let eventLog = localStorage.getItem("eventLog"+deviceLogUUID)
        if(eventLog){
            const eventString = JSON.parse(eventLog)
            //Download log as a file
            const filename = "buzz_role_"+metaDataSignal.value.role+"_run_"+metaDataSignal.value.runNumber+"_"+uuidv4()
            var file = new File([eventString], filename, {type: "text/csv;charset=utf-8"});
            saveAs(file);
        }
    }
    else if (logSource === "eventLogSignal"){
        console.log("Downloading from eventLogSignal")
        let logObject = logEventSignal.value
        let headerData = removeTrailingSeperator(logObject.header)
        let eventData = removeTrailingSeperator(logObject.data)
              
        //TODO testing broadcasting the csv data at this stage (seems to work, need to test on multiple devices)
        // Check to see that the role is defined, otherwise it will be the master controller and we do not want to broadcast the data
        console.log("Role value: ", metaDataSignal.value.role)
        if (metaDataSignal.value.role !== null && metaDataSignal.value.role !== undefined){
            console.log("BROADCASTING EVENT LOG")
            //Only update the header and data if role is defined, otherwise it will be the master controller and we do not want to update data as it is already done on the clients
            headerData = "Run number;Role;"+headerData        
            eventData =  metaDataSignal.value.runNumber+";"+metaDataSignal.value.role +";"+eventData

            let logEvent = {header:headerData, data:eventData}
            const commsObject = CommunicationsObject.value
            commsObject.publish(commsObject.loggingTopic, {eventType:"quest", eventObject: logEvent, source:metaDataSignal.value.role})
        }

        const eventString = headerData + "\n" + eventData
        const filename = "quest_role_"+metaDataSignal.value.role+"_run_"+metaDataSignal.value.runNumber+"_"+uuidv4()
        //Download log as a file
        var file = new File([eventString], filename, {type: "text/csv;charset=utf-8"});
        saveAs(file);       
    }
}