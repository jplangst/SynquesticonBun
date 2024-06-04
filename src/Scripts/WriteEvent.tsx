//import { createLogEvent } from "../Logging/loggingModule";

// Write a log event to the browsers local storage
export default function writeEvent(eventData:any){
    //const logEvent = createLogEvent(eventData.taskIndex, eventData.eventType, eventData.payload)

    // Get the stored log events
    let eventLog = localStorage.getItem("eventLog")
    
    console.log(eventData.onsetTimestamp)

    //Parse the event into a csv line
    // metadata | taskCount | loadTimestamp (Absolute) | onsetDelay | onsetTimestamp (relative or absolute?) | 
    // stimulusDuration | responseTime (relative) | response | Accuracy
    const csvLine = `${eventData.metaData};${eventData.taskCount};${eventData.loadTimestamp};`+
                    `${eventData.onsetDelay};${eventData.onsetTimestamp};${eventData.stimulusDuration};`+
                    `${eventData.responseTime};${eventData.response};${eventData.accuracy}\n`
                    
    if(eventLog){
        //Parse the events if they exist
        eventLog = JSON.parse(eventLog)
        // Append the new event
        eventLog = eventLog + csvLine
    }   
    else{
        //Otherwise write the header and the first event
        // metadata | taskCount | loadTimestamp (Absolute) | onsetDelay | onsetTimestamp (relative or absolute?) | 
        // stimulusDuration | responseTime (relative) | response
        const header = `Meta data;Task Count;Load Timestamp(hh:mm:ss:msms);Onset Delay(s);Onset Timestamp;Stimulus Duration(ms);Response Time(ms);Response;Accuracy\n`;
        eventLog = header+csvLine
    }

    // Update the local storage
    localStorage.setItem("eventLog", JSON.stringify(eventLog))
}