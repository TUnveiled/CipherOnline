<template>
    <div>
        <userbar></userbar>
        <div id="maindiv">
            <table id="matchtable">
                <tr>
                    <td id="hostpanel" style="width:33%;">
                        <!-- leftmost panel -->
                        <h2>Host a Game</h2>
                        <form @submit.prevent>
                            <h4>Game Name</h4>
                            <input class="host" v-model="gamename" type="text" :placeholder="this.$store.state.userProfile.username+'\'s Game'">
                            <h4>Game Password</h4>
                            <input class="host" type="text" readonly placeholder="Not yet implemented"><br>
                            <button v-on:click="startHosting">Start Hosting</button>
                        </form>
                        <h2>{{response}}</h2>
                    </td>
                    <td id="joinpanel" style="width:67%;">
                        <!-- rightmost panel -->
                        <h2>Join a Game</h2>
                        <table class="jointable">
                            <thead class="jointable">
                                <th class="jointable">Game Name</th>
                                <th class="jointable">Host</th>
                                <th class="jointable">Full?</th>
                                <th class="jointable">Join</th>
                            </thead>
                            <!-- Dynamic Table creation using v-for -->
                            <tbody class="jointable" id="jointablebody">
                                <tr v-for="entry in jointabledata" v-bind:key="entry['host']">
                                    <td v-for="key in keys" v-bind:key="key">
                                        <template v-if="key === 'Join'">
                                            <button class="joinbutton" v-on:click="join(entry['host'])">Join</button>
                                        </template>
                                        <template v-else>
                                            {{entry[key]}}
                                        </template>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
    import Userbar from "@/components/userbar";
    // eslint-disable-next-line no-unused-vars
    const fb = require('../firebaseConfig.js');
    const url = 'ws://127.0.0.1:4969';

    export default {
        name: "matchmaking",
        data() { return {
            gamename: "",
            response: "",
            jointabledata: [],
            keys: ["name", "host", "Full?", "Join"]
        }},
        mounted() {
            // check to see if this user already has a room and redirect accordingly
            this.alreadyHosting();

            //let query = fb.roomsCollection;
            let thisComponent = this;

            // dynamically update page to reflect changes in database -- Keep Client side
            fb.roomsCollection
                .onSnapshot(function(result) {
                    // empty the table
                    thisComponent.jointabledata = [];
                    // refill the table with new data
                    result.forEach(function(doc) {
                        let data = doc.data();
                        let nextElement = {
                            "name": data.name,
                            "host": data.host,
                            "Full?": ((data.other.localeCompare('') === 0) ? 'No' : 'Yes'),
                            "Join": data.host
                        };
                        thisComponent.jointabledata.push(nextElement);
                    });
                });
        },
        methods: {
            startHosting() {
                const serverConnection = new WebSocket(url);

                serverConnection.onopen = () => {
                    let roomName = this.gamename;
                    if (!roomName)
                        roomName = this.$store.state.userProfile.username + '\'s Game';

                    let roomMessage = {
                        type: "New Room",
                        contents:{
                            host: this.$store.state.userProfile.username,
                            name: roomName
                        }
                    }
                    serverConnection.send(JSON.stringify(roomMessage))
                }

                serverConnection.onerror = error => {
                    alert(`WebSocket error: ${error}`)      //TODO change to console
                }

                // start hosting a game
                serverConnection.onmessage = response => {
                    response = JSON.parse(response.data)

                    switch (response.type) {

                        case "route":
                            this.$router.push(response.contents.destination);
                            break;

                        case "error":
                            alert('Firebase error: ' + response.contents.errorMessage);
                            break;
                    }
                }
            },
            alreadyHosting() {
                // check if already hosting
                // store temporarily since "this" keyword won't work in the timeout function
                let username = this.$store.state.userProfile.username;
                let store = this.$store;
                let router = this.$router;
                let temp = this.alreadyHosting;

                // Redirect the user if they have a room already
                // Use recursion and timeouts to account for delays in fetching the user profile after a refresh
                setTimeout(function() {
                    if (store) {
                        if (username) {
                            fb.roomsCollection.doc(username).get().then(function (doc) {
                                if (doc.exists)
                                    router.push('/room/'+username);
                            })
                        } else
                            temp();
                    } else
                        temp();

                }, 100);

            },
            join(host) {
                let router = this.$router;
                let thisComponent = this;

                // check to see if the room is available
                fb.roomsCollection.doc(host).get().then(function(doc) {
                    // if the room doesn't have a 2 users
                    if (doc.data().other.localeCompare("") === 0) {
                        // add this user to the room in the database
                        fb.roomsCollection.doc(host).update({
                            other: thisComponent.$store.state.userProfile.username
                        }).then(function() {
                            // redirect this user to the room page
                            router.push('/room/'+host);
                        });
                    } else {
                        alert("This game is full");
                    }
                });

            }
        },
        components: {
            Userbar
        }
    }
</script>

<style>
    button.joinbutton {
        padding: 1px;
        color: white;
        background: green;
        min-width: 50px;
        max-width: 100px;
    }
</style>

<style scoped>
    #maindiv {
        width: 90%;
        min-height: 512px;
        color: darkslategrey;
        position: relative;
        border: 3px solid black;
        background-color: darkslategrey;
        margin: 0 auto;
        text-align: center;
        padding: 0;
        overflow: hidden;
    }

    #matchtable {
        width:100%;
        min-height: 512px;
    }

    #joinpanel, #hostpanel {
        border: 2px solid black;
        vertical-align: top;
    }

    .host {

    }

    button.joinbutton {
        padding: 1px;
        color: white;
        background: green;
    }


    table.jointable {
        width: 100%;
        border: 1px solid black;
    }

    thead.jointable {
        background: white;
    }

    tbody.jointable {
        background: white;
        color: black;
    }

    th.jointable {

    }
</style>