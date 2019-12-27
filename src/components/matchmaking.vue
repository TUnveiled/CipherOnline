<template>
    <div>
        <userbar></userbar>
        <div id="maindiv">
            <table id="matchtable">
                <tr>
                    <td id="hostpanel" style="width:33%;">
                        <!-- leftmost panel -->
                        <h2>Host a Game</h2>
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
</style>