<template>
    <div class="grid-container">
        <div class="infopanel">
            <img :src="infoCard['imageref']" :alt="infoCard['name']+': '+infoCard['title']">
            <table>
                <tr>
                    <td colspan="2">{{infoCard['name']+': '+infoCard['title']}}</td>
                </tr>
                <tr>
                    <td :colspan="infoCard['promotion'] ? '1' : '2'">Cost: {{infoCard['cost']}}</td>
                    <td v-if="infoCard['promotion']">Promotion: {{infoCard['promotion']}}</td>
                </tr>
                <tr>
                    <td>Attack: {{infoCard['attack']}}</td>
                    <td>Support: {{infoCard['support']}}</td>
                </tr>
                <tr>
                    <td>Range: {{infoCard['range']}}</td>
                    <td>Symbol: {{infoCard['symbol']}}</td>
                </tr>
                <tr>
                    <td colspan="2">{{infoCard['quote']}}</td>
                </tr>
            </table>
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
    const fb = require('../firebaseConfig')

    export default {
        name: "game.vue",
        data() {
            return {
                infoCard: {}
            }
        },
        mounted() {
            let thisComponent = this;
            fb.publicCollection.doc("Starter Deck 12: Three Houses").get().then(function (doc) {
                let cards = doc.data();

                let startingInfo = cards['Preferred_MCs'][0];
                fb.cardsCollection.doc(startingInfo).get().then(function (doc) {
                    thisComponent.infoCard = doc.data();
                });

            });
        },
        methods: {

        }
    }
</script>

<style scoped>
    .infopanel {
        grid-area: info;
        max-width: 312px;
    }

    .infopanel > h6, h5 {
        color: black;
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
            'info oppo oppo oppo oppo oppo oppo'
            'info game game game game game game'
            'info game game game game game game'
            'info game game game game game game'
            'info hand hand hand hand hand hand';
        grid-gap: 5px;
        background: darkslategrey;
        padding : 2px;
    }

    .grid-container > div {
        background: white;
        text-align: center;
        padding: 2px;
        font-size: 16px;
        color: black;
    }
</style>