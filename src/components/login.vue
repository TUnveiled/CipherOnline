<template>
    <div class="login">
        <div class="loginform">
            <h1> Please log in to continue.</h1>
            <form @submit.prevent="submitform">
                <input class="login" v-model="email" id="email" type="text" placeholder="address@email.com">
                <input class="login" v-model="password" id="password" type="password" placeholder="********">
                <button id="loginbutton" type="submit">Sign In</button>
            </form>
            <h1>{{response}}</h1>
        </div>
        <div id="createAccount">
            <h3> Don't have an account?</h3>
            <button id="createAccountBtn" v-on:click="createacc()">Create an Account</button>
        </div>
        <div></div>
    </div>

</template>

<script>
    import register from './register'

    export default {
        name: "login",
        data() {
            return {
                email: '',
                password: '',
                response: ''
            }
        },
        methods: {
            submitform() {
                this.axios.post('//jsonplaceholder.typicode.com/posts', {
                    email: this.email,
                    pwd: this.password
                }).then(response => {
                    this.response = JSON.stringify(response, null, 2)
                })
            },
            createacc() {
                this.$emit("inputData", register);
            }
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

    input.login {
        max-width: 512px;
    }

    .loginform {
        width: 100%;
        max-width: 512px;
        margin: auto;
    }

    #loginbutton {
        float: right;
    }

    #createAccount {
        margin-top: 128px;
    }

</style>