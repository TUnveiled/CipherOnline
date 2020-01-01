<template>
    <div>
        <userbar></userbar>
        <div id = "maindiv">
            <h1>User Profile.</h1>
        </div>
    </div>
    
</template>

<script>
    import Userbar from "./userbar";
    export default {
        name: "account",
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
        width: 90%;
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