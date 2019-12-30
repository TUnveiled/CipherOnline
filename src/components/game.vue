<template>
    <div class="grid-container">
        <div class="window" id="rps" :style="(rps) ? 'display:block' : 'display:none'">
            <button v-on:click="rpsPick('r')">ROCK</button>
            <button v-on:click="rpsPick('p')">PAPER</button>
            <button v-on:click="rpsPick('s')">SCISSORS</button>
        </div>
        <div class="window" id="cardselect" :style="(cardselect.active) ? 'display:block' : 'display:none'">
            <h2 style="color:black;">{{cardselect.message}}</h2>
            <a style="color:black;" v-if="cardselect.min === cardselect.max">
                {{cardselect.numSelected}} currently selected (need {{cardselect.max}})
            </a>
            <a style="color:black;" v-else>
                {{cardselect.numSelected}} currently selected (need {{cardselect.min}}-{{cardselect.max}})
            </a>
            <div id="cardselectdisplay">
            <table>
                <tbody>
                <tr>
                    <td v-for="element in cardselect.options" :key="element['id'] + element['count'].toString()">
                        <img height="200px" :src="element.imageref" alt="" :style="
                         'opacity: ' + ((element.valid) ? 1 : 0.5) + ';' +
                         'border: ' + ((element.selected) ? '3px solid green' : '3px solid white') + ';' +
                         'border-radius: 12px;'
                        "
                        v-on:mouseenter="infoCard=element"
                        v-on:click="select(element)">
                    </td>
                </tr>
                </tbody>
            </table>
            </div><br>
            <button :disabled="(cardselect.numSelected > cardselect.max || cardselect.numSelected < cardselect.min)"
                   v-on:click="confirmSelection">Select</button>
        </div>
        <div class="infopanel">
            <img style="width:100%" :src="infoCard['imageref']" :alt="infoCard['name']+': '+infoCard['title']">
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
            <table class="playarea">
                <tbody>
                <tr>
                    <td>Retreat</td>
                    <td>Back Line</td>
                    <td>Boundless</td>
                    <td rowspan="2">Support</td>
                </tr>
                <tr>
                    <td>Deck</td>
                    <td>Front Line</td>
                    <td>Orbs</td>
                </tr>
                <tr>
                    <td>Support</td>
                    <td>Phases</td>
                    <td>Support</td>
                </tr>
                <tr>
                    <td><facedownstack title="Orbs" :count="thisPlayer.orbs"></facedownstack></td>
                    <td style="width:75%">Front Line</td>
                    <td><facedownstack title="Deck" :count="thisPlayer.deck.length"></facedownstack></td>
                    <td rowspan="2" style="width:25%;">Support</td>
                </tr>
                <tr>
                    <td>
                        <cardstack v-if="thisPlayer.boundless[0]" title="Boundless" :count="thisPlayer.boundless.length" :imageref="thisPlayer.boundless[0]['imageref']"></cardstack>
                        <cardstack v-else title="Boundless" :count="0"></cardstack>
                    </td>
                    <td>
                        <!-- Back Line -->
                        Back Line
                    </td>
                    <td>
                        <cardstack v-if="thisPlayer.retreat[0]" title="Retreat" :count="thisPlayer.retreat.length" :imageref="thisPlayer.retreat[0]['imageref']"></cardstack>
                        <cardstack v-else title="Retreat" :count="0"></cardstack>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
        <div class="hand">
            HAND
        </div>
    </div>
</template>

<script>
    import Facedownstack from "@/components/facedownstack";
    import Cardstack from "@/components/cardstack";
    const fb = require('../firebaseConfig');

    export default {
        name: "game.vue",
        components: {Cardstack, Facedownstack},
        data() {
            return {
                infoCard: {},
                hostplayer: '',
                host: false,
                rps: false,
                cardselect: {
                    active: false,
                    options: [],
                    min: 0,
                    max: 0,
                    message: '',
                    numSelected: 0,
                    confirm: null
                },
                thisPlayer: {
                    frontLine: [],
                    backLine: [],
                    support: null,
                    deck: [],
                    retreat: [],
                    boundless: [],
                    orbs: 0,
                    knownOrbs: [],
                    bonds: [],
                    hand: []
                },
                seenCards: { },
                oppPlayer: {

                }
            }
        },
        mounted() {
            this.initialize();
        },
        methods: {
            rpsPick(option) {
                if (this.host) {
                    fb.roomsCollection.doc(this.hostplayer).update( {
                        hostrps: option
                    });
                } else {
                    fb.roomsCollection.doc(this.hostplayer).update( {
                        otherrps: option
                    })
                }
                this.rps = false;
            },
            update(data) {
                if (data['currentTurn'] < 0) { // setup
                    if ((data['otherrps'] == null && !this.host) ||
                        (data['hostrps'] == null && this.host)) {
                        // display Rock Paper Scissors
                        this.rps = true;
                    }
                    else if (data['hostFirst'] == null && this.host && data['otherrps'] != null) {
                        // determine the winner of Rock Paper Scissors
                        let hostWin = null;
                        switch (data['hostrps']) {
                            case 'r':
                                if (data['otherrps'] === 'p')
                                    hostWin = false;
                                else if (data['otherrps'] === 's')
                                    hostWin = true;
                                break;
                            case 'p':
                                if (data['otherrps'] === 'r')
                                    hostWin = true;
                                else if (data['otherrps'] === 's')
                                    hostWin = false;
                                break;
                            case 's':
                                if (data['otherrps'] === 'p')
                                    hostWin = true;
                                else if (data['otherrps'] === 'r')
                                    hostWin = false;
                                break;
                        }
                        let updateData;

                        // tie
                        if (hostWin === null)
                            updateData = {
                                otherrps: null,
                                hostrps: null
                            };
                        else // someone won
                            updateData = {hostFirst: hostWin};

                        fb.roomsCollection.doc(this.hostplayer).update(updateData);
                    }
                    else if (this.thisPlayer.deck.length === 0)
                    {
                        // Load this player's deck
                        // temp element so this doesn't trigger again
                        this.thisPlayer.deck = [null];
                        let thisComponent = this;
                        fb.publicCollection.doc("Starter Deck 12: Three Houses").get().then(function (doc) {
                            let cards = doc.data();

                            Object.keys(cards).forEach(function (nextCard) {
                                if (nextCard.localeCompare('Preferred_MCs') === 0)
                                    return;
                                let num = cards[nextCard];
                                for (let i = 0; i < num; i++)
                                    thisComponent.thisPlayer.deck.push(nextCard);
                            });
                            thisComponent.thisPlayer.deck.splice(0,1);

                        });

                    }
                    if (((this.host && data['hostMC'] == null) || (!this.host && data['otherMC'] == null))
                        && this.thisPlayer.deck.length > 0) {
                        // display pick MC box
                        if (this.cardselect.active)
                            return;
                        this.cardselect.active = true;
                        this.cardselect.max = 1;
                        this.cardselect.min = 1;
                        this.cardselect.message = 'Select your MC';
                        this.cardselect.confirm = function(selectedCards) {
                            // TODO set MC
                            alert(selectedCards);
                        };
                        let thisComponent = this;
                        // get deck from database
                        fb.publicCollection.doc("Starter Deck 12: Three Houses").get().then(function (doc) {
                            let cards = doc.data();

                            // get card data from database
                            Object.keys(cards).forEach(function (nextCard) {
                                let num = cards[nextCard];
                                if (nextCard.localeCompare('Preferred_MCs') !== 0) {
                                    fb.cardsCollection.doc(nextCard).get().then(function (cardDoc) {
                                        let cardID = cardDoc.id;
                                        let cardData = cardDoc.data();
                                        thisComponent.seenCards[cardID] = cardData;
                                        cardData['valid'] = cardData['cost'] === 1;
                                        cardData['id'] = cardID;
                                        cardData['selected'] = false;
                                        // TODO implement preferred MCs
                                        for (let i = 0; i < num; i++) {
                                            let instanceData = JSON.parse(JSON.stringify(cardData));
                                            instanceData['count'] = i;
                                            thisComponent.cardselect.options.push(instanceData);
                                        }
                                    });
                                }


                            });

                        });
                    } else alert("running");
                }

            },
            initialize() {
                if (!this.$store.state.userProfile.username) {
                    setTimeout(this.initialize, 100);
                    return;
                }
                else if (this.$store.state.userProfile.username.localeCompare("") === 0) {
                    setTimeout(this.initialize, 100);
                    return;
                }
                let thisComponent = this;
                this.hostplayer = this.$router.currentRoute.params.id;

                if (this.hostplayer.localeCompare(this.$store.state.userProfile.username) === 0)
                    this.host = true;

                fb.roomsCollection.doc(this.hostplayer).onSnapshot(function(room) {
                    let roomData = room.data();
                    thisComponent.update(roomData);
                });

                fb.publicCollection.doc("Starter Deck 12: Three Houses").get().then(function (doc) {
                    let cards = doc.data();

                    let startingInfo = cards['Preferred_MCs'][0];
                    fb.cardsCollection.doc(startingInfo).get().then(function (doc) {
                        thisComponent.infoCard = doc.data();
                    });

                });
            },
            select(card) {
                if (card['valid']) {
                    card['selected'] = !card['selected'];
                    if (card['selected'])
                        this.cardselect.numSelected++;
                    else
                        this.cardselect.numSelected--;
                }
            },
            confirmSelection() {
                let results = this.cardselect.options.filter(function(card) {
                    return card.selected;
                });

                this.cardselect.confirm(results);

                this.cardselect = {
                    active: false,
                    options: [],
                    min: 0,
                    max: 0,
                    message: '',
                    numSelected: 0,
                    confirm: null
                }
            }
        }
    }
</script>

<style scoped>
    .playarea {
        width: 100%;
    }

    .infopanel {
        grid-area: info;
    }

    .infopanel > h6, h5 {
        color: black;
    }

    .hand {
        grid-area: hand;
        min-height: 100px;
    }
    .opp {
        grid-area: oppo;
        min-height: 100px;
    }
    .gameboard {
        grid-area: game;
    }
    .grid-container {
        max-width: 1280px;
        display: grid;
        grid-template-areas:
            'info oppo'
            'info game'
            'info hand';
        grid-auto-columns: 312px auto;
        grid-gap: 4px;
        background: darkslategrey;
        padding : 2px;
    }

    .window {
        color: black;
        width: 300px;
        text-align: center;
        border: 1px solid #d0d0d0;
        padding: 3px;
        position: fixed;
        z-index: 200;
        margin-left: auto;
        margin-right: auto;
        left: 0;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
    }

    .window > button {
        border: 1px solid black;
    }

    .grid-container > div {
        background: white;
        text-align: center;
        padding: 2px;
        font-size: 16px;
        color: black;
    }

    .playarea >>> tr {
        height: 100px;
    }

    #cardselect {
        height: 50%;
        width: 50%;
        max-width: 800px;
    }

    #cardselectdisplay {
        width: 95%;
        overflow-x: scroll;
    }

</style>