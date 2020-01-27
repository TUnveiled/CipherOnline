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
    const fb = require('../firebaseConfig.js');
    import Userbar from '../components/userbar'
    export default {
        name: "room",
        mounted() {
            // retrieve host from URL
            this.hostplayer = this.$router.currentRoute.params.id;
            this.host = this.hostplayer.localeCompare(this.$store.state.userProfile.username) === 0;

            // temp variables because of how the "this" keyword works
            let router = this.$router;
            let roomC = this;

            this.getDataFromServer();

            // Get the information from the database about the room
            fb.roomsCollection.doc(this.hostplayer).get().then(function (doc) {
                //if the room doesnt exist, kick the user
                if (!doc.exists) {
                    alert("room has been closed");
                    router.push('/matchmaking');
                } else {
                    // synchronize local data with server data
                    roomC.otherplayer = doc.data().other;
                    roomC.otherReady = doc.data().otherReady;
                    roomC.hostReady = doc.data().hostReady;
                    roomC.roomName=doc.data().name;

                    // If this user is unauthorized to be in this room, kick them
                    if (roomC.otherplayer !== roomC.$store.state.userProfile.username
                        && roomC.hostplayer !== roomC.$store.state.userProfile.username)
                        router.push('/matchmaking');

                    // Dynamically update page to match changes to the database
                    fb.roomsCollection.doc(roomC.hostplayer)
                        .onSnapshot(function(doc) {
                            // if the room exists both locally and remotely, update the local version
                            if (roomC && doc.exists) {
                                roomC.otherplayer = doc.data().other;
                                roomC.otherReady = doc.data().otherReady;
                                roomC.hostReady = doc.data().hostReady;
                                // kick unauthorized users
                                if (roomC.otherplayer !== roomC.$store.state.userProfile.username
                                    && roomC.hostplayer !== roomC.$store.state.userProfile.username)
                                    router.push('/matchmaking');
                                // TODO redirect players to game if inprogress
                                if (doc.data().inprogress)
                                    router.push('/game/' + roomC.hostplayer)
                            } else {
                                // if the room doesn't exist locally and remotely, kick the user
                                alert("This room doesn't exist");
                                router.push('/matchmaking');
                            }
                        });
                }

            })
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
                
                fb.roomsCollection.doc(this.hostplayer).update({
                    other: '',
                    otherReady: false
                });
            },
            deleteRoom() {
                let router = this.$router;
                // delete the room in the database then redirect the host player to matchmaking
                // other player will be redirected by the dynamic system in mounted()
                fb.roomsCollection.doc(this.hostplayer).delete().then(function() {
                    router.push("/matchmaking");
                });
            },
            leaveRoom() {
                let router = this.$router;
                // same as kick except now the user is redirected on their own terms
                fb.roomsCollection.doc(this.hostplayer).update({
                    other: '',
                    otherReady: false
                }).then(function() {
                    router.push("/matchmaking");
                });
            },
            startGame() {
                let players = {};
                players[this.hostplayer] = {
                    rps: null,
                    MC: null
                };
                players[this.otherplayer] = {
                    rps: null,
                    MC: null
                };
                fb.roomsCollection.doc(this.hostplayer).update({
                    inprogress: true,
                    currentTurn: -1,
                    players: players,
                    currentPhase: -1
                });
            },
            toggleReady() {
                // toggle ready locally
                this.ready = !this.ready;

                // toggle ready remotely
                let temp;
                if (this.host) {
                    temp = {hostReady: this.ready};
                } else
                    temp = {otherReady: this.ready};
                fb.roomsCollection.doc(this.hostplayer).update(temp);
            },
            getDataFromServer() {

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