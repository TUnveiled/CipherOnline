<template>
    <div class="main">
        <table style="width:100%">
            <tr>
                <td><h4 style="float: left;"> Logged in as {{name}}</h4></td>
                <td><button id="logoutbtn" v-on:click="logout">Log Out</button></td>
            </tr>
        </table>
    </div>
</template>

<script>
    const fb = require('../firebaseConfig.js');

    export default {
        name: "userbar",
        data: function() {return {
            name: this.$store.state.userProfile.username
        };},
        methods: {
            logout() {
                fb.auth.signOut().then(() => {
                    this.$store.dispatch('clearData');
                    this.$router.push('/login');
                }).catch(err => {
                    alert(err);
                })
            }
        }
    }
</script>

<style scoped>
    div.main {
        color: darkslategrey;
        position: relative;
        border: 3px solid black;
        background-color: darkslategrey;
        width: 80%;
        min-width: 512px;
        margin: 0 auto;
        text-align: center;
        padding: 0px;
        overflow: hidden;
    }

    #logoutbtn {
        float: right;
        max-width: 96px;
        min-width: 32px;
    }

</style>