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
    const pf = require("../publicFunctions.js");
    // eslint-disable-next-line no-unused-vars

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


            // dynamically update page to reflect changes in database -- Keep Client side
            this.getRoomsFromServer();

        },
        methods: {
            startHosting() {
                let serverConnection = this.$store.state.connection;
                let matchmaking = this;

                function foo() {
                    let roomName = matchmaking.gamename;
                    if (!roomName)
                        roomName = matchmaking.$store.state.userProfile.username + '\'s Game';

                    if (!matchmaking.$store.state.token || !matchmaking.$store.state.userProfile.username) {
                        setTimeout(foo, 1000);
                        return;
                    }

                    let roomMessage = {
                        type: "New Room",
                        contents: {
                            token: matchmaking.$store.state.token,
                            name: roomName
                        }
                    };

                    serverConnection.send(JSON.stringify(roomMessage))
                }
                pf.checkConnection(foo, this);
            },
            alreadyHosting() {
                // TODO : Redirect the user if they have a room already
            },
            join(host) {
                if (!this.$store.state.token || !this.$store.state.userProfile.username) {
                    setTimeout(this.join, 1000, host);
                    return;
                }
                let token = this.$store.state.token;
                let serverConnection = this.$store.state.connection;
                function foo() {
                    let joinMessage = {
                        type: "Join Room",
                        contents:{
                            host: host,
                            token: token,
                        }
                    };
                    serverConnection.send(JSON.stringify(joinMessage));
                }
                pf.checkConnection(foo, this);
            },
            getRoomsFromServer() {
                let serverConnection = this.$store.state.connection;
                function foo() {
                    let message = {
                        type: "Get Rooms",
                        contents: {}
                    };

                    serverConnection.send(JSON.stringify(message));
                }
                if (this.$router.currentRoute.path.includes("matchmaking"))
                    pf.checkConnection(foo, this);

            },
            updateRoomTable(contents) {
                const matchmaking = this;
                matchmaking.jointabledata = [];
                contents.forEach(function(data) {
                    matchmaking.jointabledata.push({
                        "name": data.rname,
                        "host": data.host,
                        "Full?": data.full,
                        "Join": data.host
                    });
                });
                // TODO : check if this component is active
                setTimeout(this.getRoomsFromServer, 5000);
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