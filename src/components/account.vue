<template>
    <div>
        <userbar></userbar>
        <div id = "maindiv">
            <table style = "width: 100%">
                <tr>
                    <td style = "width: 25%">
                        <div class = "userinfo">
                            <table style="width: 100%">
                                <tr>
                                    <td style="width: 20%">
                                        <h5 style="float: left">Username:</h5>
                                    </td>
                                    <td><h5 style="float: left" v-if="username">{{username}}</h5></td>
                                </tr>
                                <tr>
                                    <td style="width: 20%">
                                        <h5 style="float: left">Email:</h5>
                                    </td>
                                    <td><h5 style="float: left" v-if="email">{{email}}</h5></td>
                                </tr>
                            </table>
                        </div>
                    </td>
                    <td style="width: 60%">
                        <div class="deckarea">
                            <h4>No decks</h4>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    </div>
    
</template>

<script>
    import Userbar from "./userbar";
    export default
    {
        name: "account",
        components: {Userbar},
        data()
        {
            return {
                username :'',
                email :''
            };
        },
        methods:
            {
            intialize()
            {
                if(!this.$store.state.userProfile.username)
                    setTimeout(this.intialize, 100);
                this.username = this.$store.state.userProfile.username;
                this.email = this.$store.state.userProfile.email;
            }
        },
        mounted() {
            this.intialize();
        }
    }

</script>

<style scoped>

    #maindiv {
        color: darkslategrey;
        position: relative;
        border: 3px solid black;
        background-color: darkslategrey;
        width: 90%;
        min-width: 512px;
        margin: 0 auto;
        text-align: center;
        padding: 32px;
        overflow: hidden;
    }

    .userinfo {
        color: grey;
        position: relative;
        border: 3px solid black;
        background-color: grey;
        width: 100%;
        padding: 16px;
    }

    .labels {


    }

    .deckarea {
        border: 3px solid black;
        position: relative;
        background-color: #2c3e50;
        width: 100%;

    }

    .link {
        color: white;
    }



</style>