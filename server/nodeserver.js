const express = require('express');

// creating an express instance
const app = express();
// const history = require('connect-history-api-fallback');

const fs = require("fs");
const localObjString =  fs.readFileSync("./private/local.json");
const localObj = JSON.parse(localObjString);


app.get('/', (req, res, next) => {
    res.sendFile("index.html", {root: localObj["publicRoot"]});
    next;
});

app.get('/css/:target', (req, res, next) => {
    res.sendFile("css/"  + req.params["target"], {root: localObj["publicRoot"]});
    next;
});

app.get('/js/:target', (req, res, next) => {
    res.sendFile("js/" + req.params["target"], {root: localObj["publicRoot"]});
    next;
});

// reroutes to vue router for unexpected "no"
app.get('/:no', (req, res, next) => {
    res.sendFile("index.html", {root: localObj["publicRoot"]});
    next;
});

//app.use(history({verbose: true}));

app.listen(3000, () => {
    // eslint-disable-next-line no-console
    console.log("Example app listening on port 3000")
});

//WebSocket Testing
const fb = require('./firebaseConfig.js');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 4969 });

wss.on('connection', ws => {
    ws.on('message', message => {
        console.log(`${message}`)
        message = JSON.parse(message);

        switch (message.type) {

            case "New Room": // add the new room to the database
                fb.roomsCollection.doc(message.contents.host).set({
                    host: message.contents.host,
                    other: "",
                    name: message.contents.name,
                    inprogress: false,
                    hostReady: false,
                    otherReady: false
                }).then(() => {

                    let routeResponse = {
                        type: "route",
                        contents:{
                            destination: '/room/' + message.contents.host
                        }
                    }
                    // route to the new room
                    ws.send(JSON.stringify(routeResponse));
                }).catch(err => {

                    let errorResponse = {
                        type: "error",
                        contents:{
                            errorMessage: err
                        }
                    }
                    //error message
                    ws.send(JSON.stringify(errorResponse));
                })
                break;

            case "Join Room":
                //
                //
                // let router = this.$router;
                // let thisComponent = this;

                // check to see if the room is available
                fb.roomsCollection.doc(message.contents.host).get().then(function(doc) {
                    // if the room doesn't have a 2 users
                    if (doc.data().other.localeCompare("") === 0) {
                        // add this user to the room in the database
                        fb.roomsCollection.doc(message.contents.host).update({
                            other: message.contents.name
                        }).then(function() {
                            // redirect this user to the room page
                            let routeResponse = {
                                type: "route",
                                contents:{
                                    destination: '/room/' + message.contents.host
                                }
                            }
                            // route to the new room
                            ws.send(JSON.stringify(routeResponse));
                        }).catch(err => {

                            let errorResponse = {
                                type: "error",
                                contents:{
                                    errorMessage: err
                                }
                            }
                            //error message
                            ws.send(JSON.stringify(errorResponse));
                        })
                    } else {

                        let fullResponse = {
                            type: "full",
                            contents:{
                                errorMessage: "The Room is Full."
                            }
                        }
                        //error message
                        ws.send(JSON.stringify(fullResponse));
                    }
                });

                break;

        }

        console.log(`Received message => ${message}`)
    })
}, true)
