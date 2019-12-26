<template>
    <div>
        <userbar></userbar>
        <div class="login">
            <h1>You are logged in.</h1>
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
    div.login {
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

</style>