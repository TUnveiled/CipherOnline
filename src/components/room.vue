<template>
    <div>
        <userbar></userbar>
        <div id="maindiv">
            <h2>{{roomName}}</h2>
            <h4>Player 1: {{hostplayer}}</h4>

            <h4>Player 2: {{otherplayer}}</h4>
            <button v-if="host" v-on:click="kick">Kick</button>
            <button v-else v-on:click="leaveRoom()">Leave Room</button><br><br>
            <button v-if="host" v-on:click="deleteRoom">Delete Room</button>
            <button v-if="host" v-on:click="startGame()">Start Game</button>
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

            // Get the information from the database about the room
            fb.roomsCollection.doc(this.hostplayer).get().then(function (doc) {
                if (!doc.exists) {
                    alert("room has been closed");
                    router.push('/matchmaking');
                } else {
                    roomC.otherplayer = doc.data().other;
                    roomC.roomName=doc.data().name;
                    if (roomC.otherplayer !== roomC.$store.state.userProfile.username
                        && roomC.hostplayer !== roomC.$store.state.userProfile.username)
                        router.push('/matchmaking');
                    fb.roomsCollection.doc(roomC.hostplayer)
                        .onSnapshot(function(doc) {
                            if (roomC) {
                                roomC.otherplayer = doc.data().other;
                                if (roomC.otherplayer !== roomC.$store.state.userProfile.username
                                    && roomC.hostplayer !== roomC.$store.state.userProfile.username)
                                    router.push('/matchmaking');
                            }
                        });
                }

            })
        },

        data() {
            return {
                hostplayer: '',
                otherplayer: '',
                roomName: '',
                host: false
            }
        },
        methods: {
            kick() {
                fb.roomsCollection.doc(this.hostplayer).update({
                    other: ''
                });
            },
            deleteRoom() {
                let router = this.$router;
                fb.roomsCollection.doc(this.hostplayer).delete().then(function() {
                    router.push("/matchmaking");
                });
            },
            leaveRoom() {
                let router = this.$router;
                fb.roomsCollection.doc(this.hostplayer).update({
                    other: ''
                }).then(function() {
                    router.push("/matchmaking");
                });
            },
            startGame() {

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