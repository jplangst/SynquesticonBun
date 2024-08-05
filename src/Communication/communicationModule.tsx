import { v4 as uuidv4 } from 'uuid';
import { signal } from "@preact/signals";

export const commsMessageSignal:null|any = signal(null)

const eventLogTopic = "events"
const commandsTopic = "commands"
let communicationDetails = {
    type: "local",
    clientUUID: uuidv4(),
    host: 'localhost',
    port: 8083
}

const commsObject:null|any = signal(null)
let commsClient:any = null

export type CommunicationContextType = {
    communicationDetails:any;
    connect:(communicationDetails:any) => any;
    publish:(topic:string, payload:any) => void;
    subscribe:(topic:string) => void;
    disconnect:() => void;
    eventLogTopic:string;
    commandsTopic:string;
}

async function prepareCommsObjectSync(communicationDetails:any){
    if(!communicationDetails)
        return
    //Dynamically import the selected communication library
    const communicationModulePath = './' + communicationDetails.type + '/Interface'
    const commsModule = await import(/* @vite-ignore */ communicationModulePath );
    commsObject.value = commsModule.default
}

async function connect(communicationDetails:any){  
    if(!communicationDetails)
        return
    // If the comms module is not loaded, then load it
    if(!commsObject.value){
        await prepareCommsObjectSync(communicationDetails)
    }

    commsClient = commsObject.value.connect(communicationDetails.clientUUID, communicationDetails.host, communicationDetails.port)
}

function publish(topic:string, payload:any){
    if(!communicationDetails || !commsObject.value)
        return

    commsObject.value.publish(topic, payload)
}

function subscribe(topic:string){
    if(!communicationDetails || !commsObject.value)
        return

    commsObject.value.subscribe(topic)
    commsClient.on('message', (topic:any, message:any) => {
        console.log("Received message on topic: ", topic.toString(), " with message: ", message.toString())
        commsMessageSignal.value = {topic:topic, message:JSON.parse(message.toString())}
    })
}

function disconnect(){
    if(!communicationDetails)
        return

    //Dynamically import the selected communication library
    const communicationModulePath = './' + communicationDetails.type + '/Interface'
    import(communicationModulePath /* @vite-ignore */).then((comModule) => {
        comModule.default.disconnect()
    }).catch(e => {
        console.log(e);
    });
}

const signalObject = {
    "communicationDetails":communicationDetails,
    "connect":connect,
    "publish":publish,
    "subscribe":subscribe,
    "disconnect":disconnect,
    "eventLogTopic":eventLogTopic,
    "commandsTopic":commandsTopic
}
export const CommunicationsObject = signal(signalObject)