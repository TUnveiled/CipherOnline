/* eslint-disable no-console,no-case-declarations */
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
app.get('/js/:target',  (req, res, next) => {
    res.sendFile("js/" + req.params["target"], {root: localObj["publicRoot"]});
    next;
});

// reroutes to vue router for unexpected "no"
app.get('/:no', (req, res, next) => {
    res.sendFile("index.html", {root: localObj["publicRoot"]});
    next;
});
app.get('/:no/:way', (req, res, next) => {
    res.sendFile("index.html", {root: localObj["publicRoot"]});
    next;
});

//app.use(history({verbose: true}));

app.listen(3000, () => {
    // eslint-disable-next-line no-console
    console.log("App listening on port 3000")
});

// WebSocket Testing
// eslint-disable-next-line no-unused-vars
let Room = require("./game_classes/room").Room;
const fb = require('./firebaseConfig.js');
const Deck = require('./game_classes/deck').Deck;
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 4969 });
let rooms = [];

// Cards in use by rooms
let activeCards = {

    addCard2Obj(id, card) {this.cardObj[id] = card},

    getCardId(id){ return this.cardObj[id]},

    cardObj: {
        // cards being referenced by rooms
    },

    skills: {
        // skills being referenced by cards
    },

    update(){
        // check what cards are active in each room and for any cards that are here but not in rooms
        // then remove reference from memory here
    }
};

new Deck(fb, activeCards);

// two objects to reduce complexity
let tokensToUsers = {
};
let usersToTokens = {
};
let usersToSockets = {
};


wss.on('connection', ws => {
    ws.on('close', function() {
        console.log("lost connection");
    });
    ws.on('message', message => {
        message = JSON.parse(message);
        console.log(message);
        let response, user, room, host, player;
        try {
            switch (message.type) {

                case "FB Tok":
                    fb.auth.verifyIdToken(message.contents.token).then(decodedToken => {
                        fb.usersCollection.doc(decodedToken.uid).get().then(document => {

                            let username = document.data().username;

                            // Remove old token
                            if (usersToTokens[username])
                                delete tokensToUsers[usersToTokens[username]];

                            // add new token
                            tokensToUsers[message.contents.token] = username;
                            usersToTokens[username] = message.contents.token;
                            usersToSockets[username] = ws;

                        });
                        // TODO : maybe send back ack idk
                    }).catch(error => {
                        error; // TODO : handle error
                    });

                    break;

                case "NewCon":
                    user = tokensToUsers[message.contents.token];
                    usersToSockets[user] = ws;

                    for (let i = 0; i < rooms.length; i++) {
                        if (rooms[i].containsUser(user)) {
                            if (rooms[i].hostedBy(user)) {
                                rooms[i].players[0].socket = ws;
                            } else {
                                rooms[i].players[1].socket = ws;
                            }
                        }
                    }
                    break;

                case "New Room": // add the new room to the database
                    host = tokensToUsers[message.contents.token];
                    if (!host) break;
                    rooms.push(new Room(host, message.contents.name, ws, activeCards));
                    // TODO : remove
                    fb.roomsCollection.doc(host).set({
                        host: host,
                        other: "",
                        name: message.contents.name,
                        inprogress: false,
                        hostReady: false,
                        otherReady: false
                    });

                    let routeResponse = {
                        type: "route",
                        contents: {
                            destination: '/room/' + host
                        }
                    };
                    // route to the new room
                    ws.send(JSON.stringify(routeResponse));
                    break;

                case "Join Room":
                    // find the room they want to join
                    let roomToJoin = rooms.filter(room => {
                        return room.hostedBy(message.contents.host);
                    })[0];

                    // add them to the room on this end
                    let uname = tokensToUsers[message.contents.token];

                    // Room was deleted before joining
                    if (!roomToJoin) {
                        let errorResponse = {
                            type: "error",
                            contents: {
                                errorMessage: "Room no Longer Exists! :("
                            }
                        };
                        ws.send(JSON.stringify(errorResponse));
                        return;
                    }

                    let success = roomToJoin.addPlayer(uname, ws);
                    // route them
                    if (success) {
                        let routeResponse = {
                            type: "route",
                            contents: {
                                destination: '/room/' + message.contents.host
                            }
                        };
                        ws.send(JSON.stringify(routeResponse));

                        // tell the host
                        let hostResponse = {
                            type: "RoomData",
                            contents: {
                                otherplayer: uname
                            }
                        };

                        console.log(uname);
                        console.log(message.contents.host);
                        roomToJoin.players[0].socket.send(JSON.stringify(hostResponse));
                    }


                    // // TODO : remove
                    // // check to see if the room is available
                    // fb.roomsCollection.doc(message.contents.host).get().then(function(doc) {
                    //     // if the room doesn't have a 2 users
                    //     if (doc.data().other.localeCompare("") === 0) {
                    //         // add this user to the room in the database
                    //         fb.roomsCollection.doc(message.contents.host).update({
                    //             other: uname
                    //         }).then(function() {
                    //             // redirect this user to the room page
                    //             let routeResponse = {
                    //                 type: "route",
                    //                 contents:{
                    //                     destination: '/room/' + message.contents.host
                    //                 }
                    //             };
                    //             // route to the new room
                    //             ws.send(JSON.stringify(routeResponse));
                    //         }).catch(err => {
                    //
                    //             let errorResponse = {
                    //                 type: "error",
                    //                 contents:{
                    //                     errorMessage: err
                    //                 }
                    //             };
                    //             //error message
                    //             ws.send(JSON.stringify(errorResponse));
                    //         })
                    //     } else {
                    //
                    //         let fullResponse = {
                    //             type: "full",
                    //             contents:{
                    //                 errorMessage: "The Room is Full."
                    //             }
                    //         };
                    //         //error message
                    //         ws.send(JSON.stringify(fullResponse));
                    //     }
                    // });

                    break;

                case "Get Rooms":

                    response = {
                        type: "rooms",
                        contents: []
                    };

                    for (let i = 0; i < rooms.length; i++) {
                        let room = rooms[i]
                        if (!room.players[0] && !room.players[1]) {
                            rooms.splice(i--, 1);
                        } else {
                            response.contents.push({
                                host: room.getHostName(),
                                rname: room.name,
                                full: room.isFull()
                            })
                        }
                    }

                    ws.send(JSON.stringify(response));

                    break;

                case "Kick":
                    let kickedPlayer = rooms.filter(room => {
                        return room.hostedBy(tokensToUsers[message.contents.token]);
                    })[0].kick();

                    response = {
                        type: "RoomData",
                        contents: {
                            otherplayer: "",  // name of non-host
                            otherReady: false
                        }
                    };
                    ws.send(JSON.stringify(response));

                    response = {
                        type: "route",
                        contents: {
                            destination: '/matchmaking'
                        }
                    };

                    kickedPlayer.socket.send(JSON.stringify(response));

                    break;

                case "GetRoomData":
                    user = tokensToUsers[message.contents.token];
                    room = rooms.filter(room => {
                        return room.containsUser(user);
                    })[0];

                    response = {
                        type: "RoomData",
                        contents: {
                            otherplayer: room.getOtherName(),  // name of non-host
                            roomName: room.name,     // name of room
                            hostReady: room.isReady(0), // is the host ready?
                            otherReady: room.isReady(1)// is the non-host ready?
                        }
                    };

                    ws.send(JSON.stringify(response));

                    break;

                case "ToggleReady":
                    user = tokensToUsers[message.contents.token];
                    room = rooms.filter(room => {
                        return room.containsUser(user);
                    })[0];

                    host = room.hostedBy(user);

                    if (host)
                        room.readyPlayer(0);
                    else
                        room.readyPlayer(1);

                    response = {
                        type: "RoomData",
                        contents: {
                            hostReady: room.isReady(0),
                            otherReady: room.isReady(1)
                        }
                    };

                    room.players[0].socket.send(JSON.stringify(response));
                    if (room.players[1])
                        room.players[1].socket.send(JSON.stringify(response));

                    break;

                case "LeaveRoom":
                    user = tokensToUsers[message.contents.token];
                    room = rooms.filter(room => {
                        return room.containsUser(user);
                    })[0];

                    host = room.hostedBy(user);

                    if (host)
                        return;

                    response = {
                        type: "route",
                        contents: {
                            destination: '/matchmaking'
                        }
                    };
                    ws.send(JSON.stringify(response));
                    room.kick();

                    // Update Host data
                    response = {
                        type: "RoomData",
                        contents: {
                            otherplayer: "",  // name of non-host
                            otherReady: false
                        }
                    };
                    room.players[0].socket.send(JSON.stringify(response));
                    break;

                case "deleteRoom":
                    // Room info
                    user = tokensToUsers[message.contents.token];
                    room = rooms.filter(room => {
                        return room.containsUser(user);
                    })[0];

                    // Ensure request was sent only by host
                    host = room.hostedBy(user);
                    if (!host)
                        return;
                    //Route player(s)
                    response = {
                        type: "route",
                        contents: {
                            destination: '/matchmaking'
                        }
                    };
                    // Second Player?
                    if (room.players[1])
                        room.players[1].socket.send(JSON.stringify(response));
                    ws.send(JSON.stringify(response));

                    // Delete Element
                    let roomIndex = rooms.findIndex(room => {
                        return room.hostedBy(user);
                    });
                    rooms.splice(roomIndex, 1);     // delete just 1 element
                    break;

                case "startGame":
                    // Room info
                    user = tokensToUsers[message.contents.token];
                    room = rooms.filter(room => {
                        return room.containsUser(user);
                    })[0];

                    if (!room.bothReady())
                        return;
                    room.startGame(fb);

                    response = {
                        type: "route",
                        contents: {
                            destination: '/game/' + room.getHostName()
                        }
                    };

                    ws.send(JSON.stringify(response));
                    room.players[1].socket.send(JSON.stringify(response));
                    break;

                case "getGameData":
                    // Room info
                    // eslint-disable-next-line no-inner-declarations
                function sendGameData() {
                    user = tokensToUsers[message.contents.token];
                    room = rooms.filter(room => {
                        return room.containsUser(user);
                    })[0];
                    if (room) {
                        room.changeSocket(user, ws);

                        room.sendGameState();
                    } else {
                        setTimeout(() => {
                            sendGameData();
                        }, 100);
                    }
                }

                    sendGameData();

                    break;

                case "rps":
                    // Room info
                    user = tokensToUsers[message.contents.token];
                    room = rooms.filter(room => {
                        return room.containsUser(user);
                    })[0];

                    room.getPlayer(user).rps = message.contents.choice;
                    console.log(room.getPlayer(user).rps);

                    if (room.checkRPS()) {

                        if (room.firstPlayer) {
                            console.log("here");
                            for (let i = 0; i < 2; i++) {
                                let options = {
                                    uiType: 'cardSelect',
                                    cardselect: {
                                        active: true, // whether the window is visible
                                        options: [], // the cards that can be selected
                                        min: 1, // the minimum number of cards that need to be selected
                                        max: 1, // the max number of cards that can be selected
                                        message: 'Select Your MC', // prompt for selection
                                        // numSelected: 0 // the number of options currently selected
                                        // confirm: null
                                    },
                                };
                                let player = room.players[i];
                                let deck = player.deck.get();


                                player.optionResults = [];
                                for (let j = 0; j < deck.length; j++) {
                                    let card = deck[j].get();
                                    let option = {
                                        id: card['id'],
                                        valid: card['cost'] === 1,
                                        selected: false
                                    };

                                    options.cardselect.options.push(JSON.parse(JSON.stringify(option)));

                                    player.optionResults.push({
                                        func: (option.valid) ? "selectMC" : null
                                    });
                                }
                                player.options = options;

                                response = {
                                    type: 'gameData',
                                    contents: {
                                        firstPlayer: room.firstPlayer.name,
                                        options: options
                                    }
                                };

                                player.socket.send(JSON.stringify(response));

                            }

                        } else {
                            response = {
                                type: 'gameData',
                                contents: {
                                    rps: 'n'
                                }
                            };

                            room.players[0].socket.send(JSON.stringify(response));
                            room.players[1].socket.send(JSON.stringify(response));
                        }


                    }

                    break;

                case "getCardData":
                    response = {
                        type: 'newCard',
                        contents: activeCards.cardObj[message.contents.id]
                    };
                    ws.send(JSON.stringify(response));
                    break;
                case "getAllData":
                    response = {
                        type: 'allCards',
                        contents: activeCards.cardObj
                    };
                    ws.send(JSON.stringify(response));
                    break;

                case "selection":
                    // Room info
                    user = tokensToUsers[message.contents.token];
                    room = rooms.filter(room => {
                        return room.containsUser(user);
                    })[0];

                    player = room.getPlayer(user);

                    console.log(JSON.stringify(player.options));

                    switch (player.options.uiType) {
                        case "cardSelect":
                            if (message.contents.results.length === 0) {
                                player.noSelection();
                            } else
                                player.selectResult(message.contents.results);

                            break;
                        case "binaryoption":
                            player.selectResult(message.contents.results[0]);
                            break;

                        case "handselect":
                        case "optionmenu":
                        case "unitselect":
                        case "confirmwindow":
                            player.selectResult(message.contents.results[0]);
                            break;
                    }

                    break;

            }
        } catch (err) {
            console.log(err);
        }


        console.log(`Received message => ${message}`)
    })
}, true);
