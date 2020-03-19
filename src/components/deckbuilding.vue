<template>
    <div class="grid-container">
        <div class="searchpanel">
            <h3>Search</h3>
            <table>
                <tr>
                    <td>Name</td>
                    <td><input type="text" v-on:input="searchChanged" v-model="search.name"></td>
                </tr>
                <tr>
                    <td>Cost</td>
                    <td><input type="checkbox" v-on:change="searchChanged" v-model="search.costs[0]">0
                        <input type="checkbox" v-on:change="searchChanged" v-model="search.costs[1]">1
                        <input type="checkbox" v-on:change="searchChanged" v-model="search.costs[2]">2
                        <input type="checkbox" v-on:change="searchChanged" v-model="search.costs[3]">3
                        <input type="checkbox" v-on:change="searchChanged" v-model="search.costs[4]">4</td>
                </tr>
            </table>
            <h3>Sort</h3>
            <div style="height: min-content; width: fit-content; text-align: left;">
                <input type="radio" id="costasc" name="sort" value="costasc" v-on:change="searchChanged" v-model="search.sort">
                <label for="costasc">Cost (Ascending)</label><br>
                <input type="radio" id="costdesc" name="sort" value="costdesc" v-on:change="searchChanged" v-model="search.sort">
                <label for="costdesc">Cost (Descending)</label><br>
                <input type="radio" id="alpha" name="sort" value="alpha" v-on:change="searchChanged" v-model="search.sort">
                <label for="alpha">Alphabetical</label>
            </div>
        </div>
        <div class="binder">
            <h3>Available Cards</h3>
            <table v-if="queriedCards.length > 0">
                <tr v-for="row in 5" :key="row">
                    <td v-for="col in 5" :key="col">
                        <bindercard
                                v-if="queriedCards[(row - 1) * 5 + col - 1]"
                                :cardref="queriedCards[(row - 1) * 5 + col - 1]"
                                :canadd="true" :count="0"
                                @hover="updateInfoPanel(queriedCards[(row - 1) * 5 + col - 1])"></bindercard>
                    </td>
                </tr>
            </table>
        </div>
        <div class="infopanel">
            <!-- Left Panel that describes the card stored as "infoCard" -->
            <img class="infoimage" :src="infoPanelCard['imageref']" :alt="infoPanelCard['name']+': '+infoPanelCard['title']">
            <div style="overflow-y: scroll; height: 216px;">
                <table style="width: 100%;">
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
        </div>
        <div class="deckarea">
            <h3>Deck</h3>
            <table style="width: 100%">
                <tr style="width: 100%">
                    <td style="width: 20%">
                        <table>
                            <tr>
                                <td>Load:</td>
                                <td><select>
                                    <option value="">None</option>
                                    <option v-for="(deck, index) in deckNames" :key="index" :value="deck">{{deck}}</option>
                                </select></td>
                            </tr>
                            <tr>
                                <td>Name:</td> <td><input type="text" style="width: 97%;"></td>
                            </tr>
                            <tr><td></td><td style="text-align: right;"><button>Save</button></td></tr>
                        </table>
                    </td>
                    <td style="width: 80%">
                        <table v-if="deck.length > 0">
                            <tr>
                                <td v-for="index in deck.cards.length" :key="index">
                                    <bindercard
                                            v-if="deck.cards[index]"
                                            :cardref="deck.cards[index]"
                                            :canadd="true" :count="0"
                                            @hover="updateInfoPanel(deck.cards[index])"></bindercard>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
    import Bindercard from "@/components/bindercard";
    const pf = require("../publicFunctions.js");

    export default {
        name: "deckbuilding",
        components: {
            Bindercard
        },
        data() {
            return {
                infoPanelCard: {
                    imageref: "https://serenesforest.net/wiki/images/a/a7/PlaceHolder.png"
                },
                allCards: [],
                queriedCards: [],
                search: {
                    name: "",
                    costs: [true, true, true, true, true],
                    sort: "costasc"
                },
                deckNames: [],
                deck: {
                    cards: []
                }
            }
        },
        mounted() {
            let serverConnection = this.$store.state.connection;
            function foo() {
                let message = {
                    type: "getAllData",
                    contents: {
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
            },
            displayAll(allCardData) {
                this.allCards = [];
                for (let i = 0; i < Object.keys(allCardData).length; i++) {
                    this.allCards.push(allCardData[Object.keys(allCardData)[i]]);
                }

                // copy the array into the queried cards
                this.queriedCards = this.allCards.slice();

                this.searchChanged();
            },
            searchChanged() {
                this.queriedCards = this.allCards.filter((card) => {
                    return this.search.costs[card['cost']] &&
                        card['name'].toUpperCase().startsWith(this.search.name.toUpperCase());
                });

                this.queriedCards = this.queriedCards.sort((card1, card2) => {
                    switch (this.search.sort) {
                        case "costasc":
                            return card1.cost - card2.cost;
                        case "costdesc":
                            return card2.cost - card1.cost;
                        case "alpha":
                            return card1.name.localeCompare(card2.name);
                    }
                });
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
        text-align: -webkit-center;
        min-height:80px;
    }
    .binder {
        grid-area: binder;
        min-height: 80px;
        max-height: 500px;
        overflow-y: scroll;
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
        padding: 2px;
        font-size: 16px;
        color: black;
    }

    .playarea >>> tr {
        height: 80px;
    }

    input[type=text] {
        min-height: 10px;
        padding: 1px;
        border-width: 3px;
        display: block;
        width: 93%;
        margin: auto;
        border-radius: 6px;
        font-size: 14px;
        -webkit-box-shadow: none;
        box-shadow: none;
    }

    select {
        min-height: 10px;
        padding: 1px;
        border-width: 3px;
        display: block;
        width: 100%;
        margin: auto;
        border-radius: 6px;
        font-size: 14px;
        -webkit-box-shadow: none;
        box-shadow: none;
    }

    h3 {
        color: black;
    }

    button {
        max-height: 25px;
        min-height: 25px;
        min-width: 100px;
        max-width: 100px;
        border-radius: 8px;
        padding: 1px 1px 1px 1px;
        text-shadow: 1px 1px grey;
        font-size: 16px;
        color: green;
        top: 60%;
        left: 5%;
        right: 0;
        bottom: 0;
        line-height: 0;
    }

</style>