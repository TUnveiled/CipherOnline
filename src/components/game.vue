<template>
    <div class="grid-container">
        <div class="infopanel">
            INFO
        </div>
        <div class="opp">
            OPPONENT
        </div>
        <div class="gameboard">
            GAME
        </div>
        <div class="hand">
            HAND
        </div>
    </div>
</template>

<script>
    export default {
        name: "game.vue",
        mounted() {
            
        },
        data() {
            return {

            }
        },
        methods: {

        }
    }
</script>

<style scoped>
    .infopanel {
        grid-area: info;

    }
    .hand {
        grid-area: hand;
    }
    .opp {
        grid-area: oppo;
    }
    .gameboard {
        grid-area: game;
    }
    .grid-container {
        display: grid;
        grid-template-areas:
            'info oppo oppo'
            'info game game'
            'info hand hand';
        grid-gap: 5px;
        background: darkslategrey;
        padding : 2px;
    }

    .grid-container > div {
        background: white;
        text-align: center;
        padding: 2px;
        font-size: 20px;
    }
</style>