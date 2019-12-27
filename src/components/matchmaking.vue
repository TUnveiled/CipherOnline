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

    export default {
        name: "matchmaking",
        data() { return {
            gamename: "",
            response: ""
        }},
        mounted() {
            this.alreadyHosting();
        },
        methods: {
            startHosting() {
                // start hosting a game
                let roomName = this.gamename;
                if (!roomName)
                    roomName = this.$store.state.userProfile.username + '\'s Game';

                // add the room to the database
                fb.roomsCollection.doc(this.$store.state.userProfile.username).set({
                    host: this.$store.state.userProfile.username,
                    other: "",
                    name: roomName,
                    inprogress: false
                }).then(() => {
                    this.$router.push('/room/'+this.$store.state.userProfile.username);
                }).catch(err => {
                    this.response = err;
                })
            },
            alreadyHosting() {
                // check if already hosting
                // store temporarily since "this" keyword won't work in the timeout function
                let username = this.$store.state.userProfile.username;
                let store = this.$store;
                let router = this.$router;
                let temp = this.alreadyHosting;
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

</style>