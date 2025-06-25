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

//TODO the metadata signal is missing data regarding the run number now. Probably because i switched signals?

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
        console.log(logEventSignal.value)
        for (const [key, log] of Object.entries(logEventSignal.value)) {
            console.log("Key:", key);
            console.log("Header:", log);

            let metaHeader = removeTrailingSeperator(log.metaHeader)
            let metaData = removeTrailingSeperator(log.metaData)
            let headerData = removeTrailingSeperator(log.header)
            let eventData = removeTrailingSeperator(log.data)
            let questionnaireKey = log.questionnaireKey

            //TODO testing broadcasting the csv data at this stage (seems to work, need to test on multiple devices)
            // Check to see that the role is defined, otherwise it will be the master controller and we do not want to broadcast the data
            console.log("Role value: ", metaDataSignal.value.role)
            if (metaDataSignal.value.role !== null && metaDataSignal.value.role !== undefined && metaDataSignal.value.role !== ""){
                console.log("BROADCASTING EVENT LOG")

                let logEvent = {metaHeader:metaHeader, metaData:metaData,header:headerData, data:eventData, questionnaireKey:questionnaireKey}
                const commsObject = CommunicationsObject.value
                commsObject.publish(commsObject.loggingTopic, {eventType:"quest", eventObject: logEvent, source:metaDataSignal.value.role})
            }

            //Download log as a file
            const lineData = eventData.trim().split("\n");
            const metaDatas =  metaData.trim().split("\n");

            let updatedLineData = []
            for(let i = 0; i < lineData.length; i++){
                updatedLineData.push(`${metaDatas[i]};${lineData[i]}`)
            } 
            //const updatedLineData = lineData.map(line => `${metaData};${line}`);
            const preparedCSVData = updatedLineData.join("\n");

            const eventString = metaHeader + ";" + headerData + "\n" + preparedCSVData
            //const eventString = metaHeader + ";" + headerData + "\n" + metaData +";"+ eventData
            const filename = questionnaireKey+"_role_"+metaDataSignal.value.role+"_run_"+metaDataSignal.value.runNumber+"_"+uuidv4()          
            var file = new File([eventString], filename, {type: "text/csv;charset=utf-8"});
            saveAs(file);   
        }

        console.log("Downloading from eventLogSignal")                  
    }
}