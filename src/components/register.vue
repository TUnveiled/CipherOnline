<template>
    <div id="register">
        <div class="registerform">
            <h1> Create your Account </h1>
            <form @submit.prevent="submitform">
                <input class="register" v-model="username" id="username" type="text" placeholder="Username">
                <button id="availabilitybtn" v-on:click="checkNameAvailability">Check Availability</button>
                <p id="availmsg"></p>
                <input class="register" v-model="email" id="email" type="text" placeholder="Email Address">
                <input class="register" v-model="password" id="password" type="password" placeholder="Password">
                <p> Your password must contain at least 10 characters including at least one capital letter, one lowercase letter and a number </p>
                <input class="register" v-model="cpassword" id="confirmpassword" type="password" placeholder="Confirm Password">
                <button id="loginbutton" type="submit">Sign In</button>
            </form>
            <h1>{{response}}</h1>
        </div>
    </div>
</template>

<script>

    export default {
        name: "register",
        methods: {
            checkNameAvailability() {
                // TODO
            }
        }
    }
</script>

<style scoped>
    #register {
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

    input.register {
        max-width: 512px;
    }

    .registerform {
        width: 100%;
        max-width: 512px;
        margin: auto;
    }

    p {
        padding: 5px;
        color: white;
    }
</style>