import MQTT_raw from './MQTT_raw';

let connected = false;
let client:any = null;

export default {
  connect(clientUUID:string, host:string|undefined, port:string|undefined){
      if(connected){         
          return client
      }

      const clientId = clientUUID;
      const username = "";
      const password = "";
      const url = `mqtt://${host}:${port}/mqtt`;
      const options:any = {
          keepalive: 30,
          protocolId: 'MQTT',
          protocolVersion: 4,
          clean: true,
          reconnectPeriod: 1000,
          connectTimeout: 30 * 1000,
          rejectUnauthorized: false
      };
      options.clientId = clientId;
      options.username = username;
      options.password = password;

      console.debug("Connecting to mqtt broker: ", url)
      client =  MQTT_raw.mqttConnect(url, options)  
      connected = true;

      return client
  },

    disconnect(){
      console.debug("Disconnecting from mqtt broker")
      MQTT_raw.mqttDisconnect()
      connected = false;
  },

    subscribe(topic:string){
      if(!connected){
        return
      }

      console.debug("Subscribing to topic: ", topic)
      MQTT_raw.mqttSub(topic)
  },

    publish(topic:string, payload:any){
      console.debug("Publishing to topic: ", topic, " with payload: ", payload)
      MQTT_raw.mqttPublish(topic, JSON.stringify(payload))
  }
}