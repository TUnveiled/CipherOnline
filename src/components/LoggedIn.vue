<template>
    <div style="padding:1px">
        <userbar></userbar>
        <div id="maindiv">
            <h1>You are logged in.</h1><br>
            <router-link class="link" to="/dashboard">Play (TODO)</router-link><br>
            <router-link class="link" to="/dashboard">Account (TODO)</router-link><br>
            <router-link class="link" to="/dashboard">Deckbuilder (TODO)</router-link><br>
        </div>
    </div>
</template>

<script>

    import Userbar from "@/components/userbar";
    // eslint-disable-next-line no-unused-vars
    const fb = require('../firebaseConfig.js');


    export default {
        name: "loggedin",
        components: {Userbar},
        data() {
            return {

            }
        },
        methods: {

        }
    }

</script>

<style scoped>

    #maindiv {
        color: darkslategrey;
        position: relative;
        border: 3px solid black;
        background-color: darkslategrey;
        width: 50%;
        min-width: 512px;
        margin: 0 auto;
        text-align: center;
        padding: 32px;
        overflow: hidden;
    }

    .link {
        color: white;
    }



</style>