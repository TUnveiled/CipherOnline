<template>
    <div class="grid-container">
        <div class="searchpanel">
            searchpanel
        </div>
        <div class="binder">
            binder
        </div>
        <div class="infopanel">
            <!-- Left Panel that describes the card stored as "infoCard" -->
            <img class="infoimage" :src="infoPanelCard['imageref']" :alt="infoPanelCard['name']+': '+infoPanelCard['title']">
            <table>
                <tr>
                    <td colspan="2">{{infoPanelCard['name']+': '+infoPanelCard['title']}}</td>
                </tr>
                <tr>
                    <td :colspan="infoPanelCard['promotion'] ? '1' : '2'">Cost: {{infoPanelCard['cost']}}</td>
                    <td v-if="infoPanelCard['promotion']">Promotion: {{infoPanelCard['promotion']}}</td>
                </tr>
                <tr>
                    <td>Attack: {{infoPanelCard['attack']}}</td>
                    <td>Support: {{infoPanelCard['support']}}</td>
                </tr>
                <tr>
                    <td>Range: {{infoPanelCard['range']}}</td>
                    <td>Symbol: {{infoPanelCard['symbol']}}</td>
                </tr>
                <tr>
                    <td colspan="2">{{infoPanelCard['quote']}}</td>
                </tr>
                <tr v-if="!infoPanelCard['skills']"></tr>
                <tr v-else v-for="(skill, index) in infoPanelCard['skills']" :key="index"><td colspan="2">
                    {{skill.name}} : [{{skill.suppType ? skill.suppType : ''}} {{skill.type}}] {{skill.desc}}
                </td></tr>
            </table>
        </div>
        <div class="deckarea">
            deck
        </div>
    </div>
</template>

<script>
    const pf = require("../publicFunctions.js");

    export default {
        name: "deckbuilding",
        data() {
            return {
                infoPanelCard: {
                    imageref: ''
                }
            }
        },
        mounted() {
            let serverConnection = this.$store.state.connection;
            function foo() {
                let message = {
                    type: "getCardData",
                    contents: {
                        id: 'S12-002ST'
                    }
                };
                serverConnection.send(JSON.stringify(message));
            }
            //  gets card data from database if it isn't already stored
            pf.checkConnection(foo, this);
        },
        methods: {
            updateInfoPanel(cardData) {
                this.infoPanelCard = cardData;
            }
        }
    }
</script>

<style scoped>
    .infopanel {
        grid-area: infpnl;
    }

    .infoimage {
        max-width: 200px;
    }

    .infopanel > h6, h5 {
        color: black;
    }

    .infopanel >>> td {
        font-size: 12px;
    }

    .searchpanel {
        grid-area: search;
        min-height:80px;
        overflow-x: scroll;
    }
    .binder {
        grid-area: binder;
        min-height: 80px;
        overflow-x: scroll;
    }
    .deckarea {
        grid-area: deckar;
        width: 100%
    }
    .grid-container {
        max-width: 1280px;
        display: grid;
        grid-template-areas:
                'search binder infpnl'
                'search binder infpnl'
                'deckar deckar deckar';
        grid-auto-columns: 20% 50% 30%;
        grid-gap: 4px;
        background: black;
        padding : 2px;
    }

    .grid-container > div {
        background: white;
        text-align: center;
        padding: 2px;
        font-size: 16px;
        color: black;
    }

    .playarea >>> tr {
        height: 80px;
    }

</style>