// Write a log event to the browsers local storage
// NB currently only used for the BuzzingExperiment
export default function writeEvent(eventData:any){

    // Get the stored log events
    let eventLog = localStorage.getItem("eventLog")

    //Parse the event into a csv line
    // metadata | taskCount | loadTimestamp (Absolute) | onsetDelay | onsetTimestamp (relative or absolute?) | 
    // stimulusDuration | responseTime (relative) | response | Accuracy
    const csvLine = `${eventData.runNumber};${eventData.role};${eventData.taskCount};${eventData.loadTimestamp};${eventData.relativeExperimentStartLoadTimestamp};`+
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
        const header = `Run;Role;Task Count;Load Timestamp(hh:mm:ss:msms);Relative Load Timestamp(mm:ss:msms);Onset Delay(s);Onset Timestamp;Stimulus Duration(ms);Response Time(ms);Response;Accuracy\n`;
        eventLog = header+csvLine
    }

    // Update the local storage
    localStorage.setItem("eventLog", JSON.stringify(eventLog))
}