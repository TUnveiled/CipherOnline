<template>
    <div>
        <userbar></userbar>
        <div id="maindiv">
            <h2>{{roomName}}</h2>
            <h4>Player 1: {{hostplayer}} ({{hostReady ? "ready" : "not ready" }})</h4>

            <h4>Player 2: {{otherplayer}} ({{otherReady ? "ready" : "not ready" }})</h4>
            <button v-if="host" v-on:click="kick">Kick</button>
            <button v-else v-on:click="leaveRoom()">Leave Room</button><br><br>
            <button v-if="host" v-on:click="deleteRoom">Delete Room</button><br><br>
            <button v-if="host" v-on:click="startGame()" :disabled="!otherReady || !hostReady">Start Game</button><br><br>
            <button v-on:click="toggleReady()">{{ready ? "Unready" : "Ready"}}</button>
        </div>
    </div>
</template>

<script>
    const pf = require('../publicFunctions.js');
    import Userbar from '../components/userbar'
    export default {
        name: "room",
        mounted() {
            // retrieve host from URL
            this.hostplayer = this.$router.currentRoute.params.id;
            this.host = this.hostplayer.localeCompare(this.$store.state.userProfile.username) === 0;

            this.getDataFromServer();
        },

        data() {
            return {
                hostplayer: '',   // name of host
                otherplayer: '',  // name of non-host
                roomName: '',     // name of room
                host: false,      // is the current user the host?
                ready: false,     // is the current user ready?
                hostReady: false, // is the host ready?
                otherReady: false // is the non-host ready?
            }
        },
        methods: {
            kick() {
                // update database to show that the other player is empty
                // The other player will be redirected to matchmaking by the same system
                // that authorizes players
                let serverConnection = this.$store.state.connection;
                let token = this.$store.state.token;
                function foo() {
                        let message = {
                            type: "Kick",
                            contents: {token: token}
                        };

                        serverConnection.send(JSON.stringify(message));
                }

                pf.checkConnection(foo, this);
            },
            // TODO Socket
            deleteRoom() {
                let serverConnection = this.$store.state.connection;
                let room = this;
                function foo() {
                    let message = {
                        type: "deleteRoom",
                        contents: {token: room.$store.state.token}
                    };
                    serverConnection.send(JSON.stringify(message));
                }
                pf.checkConnection(foo, this);
            },
            leaveRoom() {
                let serverConnection = this.$store.state.connection;
                let room = this;
                function foo() {
                    let message = {
                        type: "LeaveRoom",
                        contents: {token: room.$store.state.token}
                    };

                    serverConnection.send(JSON.stringify(message));
                }
                pf.checkConnection(foo, this);

            },
            startGame() {

                let serverConnection = this.$store.state.connection;
                let room = this;
                function foo() {
                    let message = {
                        type: "startGame",
                        contents: {token: room.$store.state.token}
                    };
                    serverConnection.send(JSON.stringify(message));
                }
                pf.checkConnection(foo, this);
            },
            toggleReady() {
                // toggle ready locally
                this.ready = !this.ready;
                let serverConnection = this.$store.state.connection;
                let room = this;
                function foo() {
                    let message = {
                        type: "ToggleReady",
                        contents: {token: room.$store.state.token}
                    };

                    serverConnection.send(JSON.stringify(message));
                }

                pf.checkConnection(foo, this);
            },
            getDataFromServer() {
                let serverConnection = this.$store.state.connection;
                let token = this.$store.state.token;
                function foo() {
                    let message = {
                        type: "GetRoomData",
                        contents: {token: token}
                    };

                    serverConnection.send(JSON.stringify(message));
                }

                pf.checkConnection(foo, this);

            },
            updateRoom(contents) {
                if (contents.hasOwnProperty("hostReady"))
                    this.hostReady = contents.hostReady;
                if (contents.hasOwnProperty("otherReady"))
                    this.otherReady = contents.otherReady;
                if (contents.hasOwnProperty("roomName"))
                    this.roomName = contents.roomName;
                if (contents.hasOwnProperty("otherplayer"))
                    this.otherplayer = contents.otherplayer;

                this.ready = this.host ? this.hostReady : this.otherReady;
            }
        },
        components: {
            Userbar
        }
    }
</script>

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
</style>