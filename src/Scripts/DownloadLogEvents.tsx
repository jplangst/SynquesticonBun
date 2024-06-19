import { saveAs } from 'file-saver';
import { getUUID } from '../Logging/loggingModule';

import { logEventSignal } from '../ModuleRenderComponent';

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
        let test = localStorage.getItem("eventLog")
        if(test){
            const eventString = JSON.parse(test)
            //Download log as a file
            var file = new File([eventString], getUUID(), {type: "text/csv;charset=utf-8"});
            saveAs(file);
        }
    }
    else if (logSource === "eventLogSignal"){
        let logObject = logEventSignal.value
        const headerData = removeTrailingSeperator(logObject.header)
        const eventData = removeTrailingSeperator(logObject.data)

        const eventString = headerData + "\n" + eventData
        //Download log as a file
        var file = new File([eventString], getUUID(), {type: "text/csv;charset=utf-8"});
        saveAs(file);       
    }
}