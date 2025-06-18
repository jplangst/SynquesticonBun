### Mosquitto
Install mosquitto broker with windows service
Add the following to the mosquitto conf file found in the install directory:
listener 1883
listener 8080
protocol websockets
allow_anonymous true

## Synquesticon
run command "npm install" in the root directory in CMD
run command "npm run dev" to start in CMD