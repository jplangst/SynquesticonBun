//import * as mqtt from 'mqtt/dist/mqtt.min';
import mqtt from 'mqtt'
let client:any = null;
const qos = 2;

export default{
  mqttConnect(host:any, mqttOption:any) {
    client = mqtt.connect(host, mqttOption);
    return client;
  },
  mqttDisconnect() {
    if(client){
      client.end();
    }
  },
  mqttPublish(topic:any, payload:any){
    if (client) {
      client.publish(topic, payload, { qos }, (error: any) => {
        if (error) {
          console.log('Publish error: ', error);
        }
      });
    }
  },
  mqttSub(topic: string){
    if (client) {
      client.subscribe(topic, { qos }, (error: any) => {
        if (error) {
          console.log('Subscribe to topics error', error);
          return
        }
      });
    }
  },
  mqttUnSub(topic: any){
    if (client) {
      client.unsubscribe(topic, (error: any) => {
        if (error) {
          console.log('Unsubscribe error', error);
          return
        }
      });
    }
  }
}
