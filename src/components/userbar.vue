<template>
    <div id="userbar">
        <table style="width:100%; max-height:64px;">
            <tr>
                <td>
                    <h4 style="float: left;" v-if="username"> Logged in as {{username}}</h4>
                    <h4 style="float: left;" v-else> Logged in</h4>
                </td>
                <td>
                    <button id="logoutbtn" v-on:click="logout">Log Out</button>
                    <button id="dashboard" v-on:click="dashboard">Dashboard</button>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
    const fb = require('../firebaseConfig.js');

    export default {
        name: "userbar",
        data() {
            return {
                username: this.$store.state.userProfile.username
            };
        },
        mounted() {
            this.updatebar();
        },
        methods: {
            logout() {
                fb.auth.signOut().then(() => {
                    this.$store.dispatch('clearData');
                    this.$router.push('/login');
                }).catch(err => {
                    alert(err);
                })
            },
            dashboard() {
                this.$router.push('/dashboard');
            },
            updatebar() {
                this.username = this.$store.state.userProfile.username;
                if (!this.username)
                    setTimeout(this.updatebar, 100);
            }
        }
    }
</script>

<style scoped>
    #userbar {
        color: darkslategrey;
        position: relative;
        border: 3px solid black;
        background-color: darkslategrey;
        width: 80%;
        min-width: 512px;
        min-height: 64px;
        margin: 0 auto;
        text-align: center;
        padding: 0;
        overflow: hidden;
    }

    #logoutbtn, #dashboard {
        float: right;
        max-width: 128px;
        min-width: 64px;
        text-align: center;
    }

</style>