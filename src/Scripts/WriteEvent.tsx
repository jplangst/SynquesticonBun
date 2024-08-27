// Write a log event to the browsers local storage
// NB currently only used for the BuzzingExperiment

import { deviceLogUUID } from "../ModuleRenderComponent";

export default function writeEvent(eventData:any){

    // Get the stored log events
    let eventLog = localStorage.getItem("eventLog"+deviceLogUUID)

    //Parse the event into a csv line
    // Run Number | Role | Buzz Number | BuzzTimestamp-Abs | BuzzTimestamp-Rel | 
    // Response Time (relative to BuzzTimestamp-Abs) | Stimulus Duration | Response | Accuracy
    const csvLine = `${eventData.runNumber};${eventData.role};${eventData.buzzNmb};${eventData.BuzzTimestampAbs};${eventData.BuzzTimestampRel};`+
                    `${eventData.responseTime};${eventData.stimulusDuration};`+
                    `${eventData.response};${eventData.accuracy}\n`
                    
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
        const header = `Run;Role;Buzz Number;Buzz Timestamp(hh:mm:ss:msms);Buzz Relative Timestamp(mm:ss:msms);Response Time(ms);Stimulus Duration(ms);Response;Accuracy\n`;
        eventLog = header+csvLine
    }

    // Update the local storage
    localStorage.setItem("eventLog"+deviceLogUUID, JSON.stringify(eventLog))
}