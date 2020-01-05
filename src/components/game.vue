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
        <div class="window" id="binaryoption" :style="binaryoption.active ? 'display:block' : 'display:none'">
            <h2 style="color:black">{{binaryoption.prompt}}</h2>
            <button v-on:click="binaryYes">yes</button>
            <button v-on:click="binaryNo">no</button>
        </div>
        <div class="window" id="optionmenu" :style="optionmenu.active ? 'display:block' : 'display:none'">
            <h5 style="color:black">{{optionmenu.prompt}}</h5>
            <div v-for="(option, index) in optionmenu.options" :key="index">
            <button v-on:click="optionmenu.select(index)">{{option.name}}</button>
            </div>
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
            <table>
                <tbody>
                <tr v-if="thisPlayer.hand.length > 0">
                    <td style="width:50%;"></td>
                    <td v-for="index in oppPlayer.hand" :key="index">
                        <img height="80px" src="https://serenesforest.net/wiki/images/a/a7/PlaceHolder.png" alt="card">
                    </td>
                    <td style="width:50%;"></td>
                </tr>
                <tr v-else>HAND</tr>
                </tbody>
            </table>
        </div>
        <div class="gameboard">
            <table class="playarea">
                <tbody>
                <tr>
                    <td>
                        <cardstack v-if="oppPlayer.retreat[0]" title="Retreat" :count="oppPlayer.retreat.length" :imageref="oppPlayer.retreat[0]['imageref']"></cardstack>
                        <cardstack v-else title="Retreat" :count="0"></cardstack>
                    </td>
                    <td>
                        <div v-if="oppPlayer.backLine">
                        <table v-if="oppPlayer.backLine.length > 0"><tbody><tr>
                            <td style="width: 50%;"></td>
                            <td v-for="(unit, index) in oppPlayer.backLine" :key="index">
                                <unit :oref="unit" @hover="setInfoCard"></unit>
                            </td>
                            <td style="width: 50%;"></td>
                        </tr></tbody></table>
                            <a v-else>Back Line</a>
                        </div>
                        <a v-else>Back Line</a>
                    </td>
                    <td>
                        <cardstack v-if="oppPlayer.boundless[0]" title="Boundless" :count="oppPlayer.boundless.length" :imageref="oppPlayer.boundless[0]['imageref']"></cardstack>
                        <cardstack v-else title="Retreat" :count="0"></cardstack>
                    </td>
                    <td rowspan="2">
                        <a v-if="!oppPlayer.bonds">Bonds</a>
                        <a v-else-if="oppPlayer.bonds.length === 0">Bonds</a>
                        <bondarea v-else :dataref="oppPlayer.bonds"></bondarea>
                    </td>
                </tr>
                <tr>
                    <td><facedownstack title="Deck" :count="oppPlayer.deck"></facedownstack></td>
                    <td>
                        <div v-if="oppPlayer.frontLine">
                            <table v-if="oppPlayer.frontLine.length > 0"><tbody><tr>
                                <td style="width: 50%;"></td>
                                <td v-for="(unit, index) in oppPlayer.frontLine" :key="index">
                                    <unit :oref="unit" @hover="setInfoCard"></unit>
                                </td>
                                <td style="width: 50%;"></td>
                            </tr></tbody></table>
                            <a v-else>Front Line</a>
                        </div>
                        <a v-else>Back Line</a>
                    </td>
                    <td><facedownstack title="Orbs" :count="oppPlayer.orbs"></facedownstack></td>
                </tr>
                <tr>
                    <td>Support</td>
                    <td>
                        Phases<br>
                        <button class="phasebutton" disabled :style="(phase === 0) ? 'background: lightgreen;' : ''">
                            Beginning
                        </button>
                        <button class="phasebutton" disabled :style="(phase === 1) ? 'background: lightgreen;' : ''">
                            Bond
                        </button>
                        <button class="phasebutton" :disabled="!turn || phase !== 1"
                                :style="(phase === 2) ? 'background: lightgreen;' : ''" v-on:click="nextPhase">
                            Deploy
                        </button>
                        <button class="phasebutton" :disabled="!turn || phase !== 2"
                                :style="(phase === 3) ? 'background: lightgreen;' : ''" v-on:click="nextPhase">
                            Action
                        </button>
                        <button class="phasebutton" :disabled="!turn || phase !== 3"
                                :style="(phase === 4) ? 'background: lightgreen;' : ''" v-on:click="nextPhase">
                            End
                        </button>
                        <br>{{centermessage}}
                    </td>
                    <td>Support</td>
                </tr>
                <tr>
                    <td><facedownstack title="Orbs" :count="thisPlayer.orbs"></facedownstack></td>
                    <td style="width:75%">
                        <table v-if="thisPlayer.frontLine.length > 0"><tbody><tr>
                            <td style="width:50%;"></td>
                            <td v-for="(unit, index) in thisPlayer.frontLine" :key="index">
                                <unit :oref="unit" @hover="setInfoCard"
                                      @click="unitClicked(thisPlayer.frontLine, index)"></unit>
                            </td>
                            <td style="width:50%;"></td>
                        </tr></tbody></table>
                        <a v-else>Front Line</a>
                    </td>
                    <td><facedownstack title="Deck" :count="thisPlayer.deck"></facedownstack></td>
                    <td rowspan="2" style="width:25%;">
                        <a v-if="!thisPlayer.bonds">Bonds</a>
                        <a v-else-if="thisPlayer.bonds.length === 0">Bonds</a>
                        <bondarea v-else :dataref="thisPlayer.bonds"></bondarea>
                    </td>
                </tr>
                <tr>
                    <td>
                        <cardstack v-if="thisPlayer.boundless[0]" title="Boundless" :count="thisPlayer.boundless.length" :imageref="thisPlayer.boundless[0]['imageref']"></cardstack>
                        <cardstack v-else title="Boundless" :count="0"></cardstack>
                    </td>
                    <td>
                        <table v-if="thisPlayer.backLine.length > 0"><tbody><tr>
                            <td style="width:50%;"></td>
                            <td v-for="(unit, index) in thisPlayer.backLine" :key="index">
                                <unit :oref="unit" @hover="setInfoCard"
                                      @click="unitClicked(thisPlayer.backLine, index)"></unit>
                            </td>
                            <td style="width:50%;"></td>
                        </tr></tbody></table>
                        <a v-else>Back Line</a>
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
            <table>
                <tbody>
                <tr v-if="thisPlayer.hand.length === 0">HAND</tr>
                <tr v-else>
                    <td style="width:50%;"></td>
                    <td v-for="(card, index) in thisPlayer.hand" :key="index">
                        <div v-if="!seenCards[card]">
                            <a v-if="fetchCardData(card)"></a>
                        </div>
                        <img v-else height="80px" :src="seenCards[card].imageref" :alt="card"
                             v-on:mouseenter="infoCard=seenCards[card]" v-on:click="handClick(index)">
                    </td>
                    <td style="width:50%;"></td>
                </tr>

                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
    import Facedownstack from "@/components/facedownstack";
    import Cardstack from "@/components/cardstack";
    import Unit from "@/components/unit"
    import Bondarea from "@/components/bondarea"
    const fb = require('../firebaseConfig');

    export default {
        name: "game.vue",
        components: {Cardstack, Facedownstack, Unit, Bondarea},
        data() {
            return {
                infoCard: {},
                hostplayer: '',
                otherplayer: '',
                host: false,
                rps: false,
                turn: false,
                mana: 0,
                phase: -1,
                communicating: false,
                centermessage: '',
                cardselect: {
                    active: false,
                    options: [],
                    min: 0,
                    max: 0,
                    message: '',
                    numSelected: 0,
                    confirm: null
                },
                binaryoption: {
                    active: false,
                    prompt: '',
                    yes: null,
                    no: null
                },
                optionmenu: {
                    active: false,
                    prompt: '',
                    options: [],
                    select(index) {
                        this.options[index].onSelect();
                        this.active = false;
                        this.prompt = '';
                        this.options = [];
                    }
                },
                thisPlayer: {
                    username: '',
                    frontLine: [],
                    backLine: [],
                    support: null,
                    deck: 0,
                    retreat: [],
                    boundless: [],
                    orbs: 0,
                    knownOrbs: [],
                    bonds: [],
                    hand: []
                },
                seenCards: { },
                oppPlayer: {
                    username: '',
                    frontLine: [],
                    backLine: [],
                    support: null,
                    deck: 0,
                    retreat: [],
                    boundless: [],
                    orbs: 0,
                    knownOrbs: [],
                    bonds: [],
                    hand: []
                }
            }
        },
        mounted() {
            this.initialize();
        },
        methods: {
            rpsPick(option) {
                let updateData = {};
                updateData["players." + this.thisPlayer.username + ".rps"] = option;
                fb.roomsCollection.doc(this.hostplayer).update(updateData);
                this.rps = false;
            },
            update(data) {
                if (data['currentTurn'] < 0) { // setup
                    this.otherplayer = data['other'];
                    if (data.players[this.thisPlayer.username].frontLine)
                        this.thisPlayer.frontLine = data.players[this.thisPlayer.username].frontLine;
                    else
                        this.thisPlayer.frontLine = [];

                    if (data.players[this.thisPlayer.username].hand)
                        this.thisPlayer.hand = data.players[this.thisPlayer.username].hand;
                    else
                        this.thisPlayer.hand = [];

                    if (data.players[this.thisPlayer.username].deck)
                        this.thisPlayer.deck = data.players[this.thisPlayer.username].deck.length;
                    else
                        this.thisPlayer.deck = 0;

                    if (data.players[this.oppPlayer.username].deck)
                        this.oppPlayer.deck = data.players[this.oppPlayer.username].deck.length;
                    else
                        this.oppPlayer.deck = 0;

                    if (data.players[this.oppPlayer.username].hand)
                        this.oppPlayer.hand = data.players[this.oppPlayer.username].hand.length;
                    else
                        this.oppPlayer.hand = 0;

                    if (data.players[this.thisPlayer.username].orbs)
                        this.thisPlayer.orbs = data.players[this.thisPlayer.username].orbs.length;
                    if (data.players[this.oppPlayer.username].orbs)
                        this.oppPlayer.orbs = data.players[this.oppPlayer.username].orbs.length;

                    // TODO change so you can't see opponent's MC during setup after testing
                    if (this.oppPlayer.username) {
                        if (data.players[this.oppPlayer.username].frontLine)
                            this.oppPlayer.frontLine = data.players[this.oppPlayer.username].frontLine;
                        else
                            this.oppPlayer.frontLine = [];
                    }

                    if (data.players[this.thisPlayer.username].rps == null) {
                        // display Rock Paper Scissors
                        this.rps = true;
                    }
                    else if (data['hostFirst'] == null && this.host && data.players[this.otherplayer].rps != null) {
                        // determine the winner of Rock Paper Scissors
                        let hostWin = null;
                        switch (data.players[this.hostplayer].rps) {
                            case 'r':
                                if (data.players[this.otherplayer].rps === 'p')
                                    hostWin = false;
                                else if (data.players[this.otherplayer].rps === 's')
                                    hostWin = true;
                                break;
                            case 'p':
                                if (data.players[this.otherplayer].rps === 'r')
                                    hostWin = true;
                                else if (data.players[this.otherplayer].rps === 's')
                                    hostWin = false;
                                break;
                            case 's':
                                if (data.players[this.otherplayer].rps === 'p')
                                    hostWin = true;
                                else if (data.players[this.otherplayer].rps === 'r')
                                    hostWin = false;
                                break;
                        }
                        let updateData;

                        // tie
                        if (hostWin === null) {
                            updateData = {};
                            updateData['players.' + this.hostplayer + '.rps'] = null;
                            updateData['players.' + this.otherplayer + '.rps'] = null;
                        }
                        else // someone won
                            updateData = {hostFirst: hostWin};

                        fb.roomsCollection.doc(this.hostplayer).update(updateData);
                    }
                    else
                    if (data.players[this.$store.state.userProfile.username].MC === null
                        && !this.cardselect.active && data.hostFirst != null) {
                        // display pick MC box
                        this.cardselect.active = true;
                        this.cardselect.max = 1;
                        this.cardselect.min = 1;
                        this.cardselect.message = 'Select your MC';
                        let thisComponent = this;
                        // function to set MC
                        this.cardselect.confirm = function(selectedCards) {
                            let MC = {
                                cards: [selectedCards[0]],
                                MC: true,
                                tapped: false
                            };

                            let prefix = 'players.' + thisComponent.thisPlayer.username + '.';
                            let updateData;
                            updateData = {};
                            updateData[prefix + 'MC'] = MC.cards[0].name;
                            updateData[prefix + 'frontLine'] = [MC];
                            updateData[prefix + 'backLine'] = [];
                            updateData[prefix + 'support'] = null;
                            updateData[prefix + 'deck'] = [];
                            updateData[prefix + 'retreat'] = [];
                            updateData[prefix + 'boundless'] = [];
                            updateData[prefix + 'orbs'] = [];
                            updateData[prefix + 'bonds'] = [];
                            updateData[prefix + 'hand'] = [];

                            fb.roomsCollection.doc(thisComponent.hostplayer).update(updateData);

                            // set up deck:
                            fb.publicCollection.doc("Starter Deck 12: Three Houses").get().then(function (doc) {
                                let cards = doc.data();
                                let deck = [];
                                delete cards['Preferred_MCs'];

                                cards[MC.cards[0].id]--;
                                Object.keys(cards).forEach(function (nextCard) {
                                    for (let i=0; i < cards[nextCard]; i++)
                                        deck.push(nextCard);
                                });
                                thisComponent.shuffle(deck);

                                let hand = [];
                                for (let i = 0; i < 6; i++)
                                    hand.push(thisComponent._draw(deck));

                                let updateData = {};
                                updateData[prefix + 'deck'] = deck;
                                updateData[prefix + 'hand'] = hand;
                                updateData[prefix + 'mulligan'] = false;

                                fb.roomsCollection.doc(thisComponent.hostplayer).update(updateData);

                                // mulligan
                                thisComponent.binaryoption.prompt = "would you like to mulligan?";
                                thisComponent.binaryoption.yes = function() {
                                    fb.roomsCollection.doc(thisComponent.hostplayer).get().then( function(doc) {
                                        let data = doc.data();
                                        let deck = data.players[thisComponent.thisPlayer.username].deck;

                                        let hand = data.players[thisComponent.thisPlayer.username].hand;
                                        deck = deck.concat(hand);

                                        hand = [];
                                        thisComponent.shuffle(deck);
                                        for (let i = 0; i < 6; i++)
                                            hand.push(thisComponent._draw(deck));

                                        let prefix = 'players.' + thisComponent.thisPlayer.username + '.';
                                        let updateData;
                                        updateData = {};

                                        updateData[prefix + 'deck'] = deck;
                                        updateData[prefix + 'hand'] = hand;
                                        updateData[prefix + 'mulligan'] = true;

                                        // TODO check mulligan property for security
                                        fb.roomsCollection.doc(thisComponent.hostplayer).update(updateData);
                                        thisComponent.addOrbs(5, false, false);
                                    });
                                };
                                thisComponent.binaryoption.no = (function() {
                                    let updateData = {};
                                    let prefix = 'players.' + thisComponent.thisPlayer.username + '.';
                                    updateData[prefix + 'mulligan'] = true;

                                    fb.roomsCollection.doc(thisComponent.hostplayer).update(updateData);

                                    thisComponent.addOrbs(5, false, false);
                                });
                                thisComponent.binaryoption.active = true;
                            });

                        };

                        // get deck from database
                        fb.publicCollection.doc("Starter Deck 12: Three Houses").get().then(function (doc) {
                            let cards = doc.data();
                            thisComponent.deck = cards.length - 1;

                            // get card data from database
                            Object.keys(cards).forEach(function (nextCard) {
                                let num = cards[nextCard];
                                if (nextCard.localeCompare('Preferred_MCs') !== 0) {
                                    fb.cardsCollection.doc(nextCard).get().then(function (cardDoc) {
                                        let cardID = cardDoc.id;
                                        let cardData = cardDoc.data();
                                        cardData['id'] = cardID;
                                        thisComponent.seenCards[cardID] = cardData;
                                        cardData['valid'] = cardData['cost'] === 1;
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
                    } else if (this.host && data.players[this.otherplayer].orbs.length > 0
                                && data.players[this.hostplayer].orbs.length > 0) {
                        // ready to start the game
                        this.startGame();
                    }
                } else {
                    // game has begun

                    // update this player's gameboard
                    this.thisPlayer.frontLine = data.players[this.thisPlayer.username].frontLine;
                    this.thisPlayer.backLine = data.players[this.thisPlayer.username].backLine;
                    this.thisPlayer.support = data.players[this.thisPlayer.username].support;
                    this.thisPlayer.deck = data.players[this.thisPlayer.username].deck.length;
                    this.thisPlayer.retreat = data.players[this.thisPlayer.username].retreat;
                    this.thisPlayer.boundless = data.players[this.thisPlayer.username].boundless;
                    this.thisPlayer.orbs = data.players[this.thisPlayer.username].orbs.length;
                    this.thisPlayer.bonds = data.players[this.thisPlayer.username].bonds;
                    this.thisPlayer.hand = data.players[this.thisPlayer.username].hand;
                    if (data.players[this.thisPlayer.username].mana)
                        this.mana = data.players[this.thisPlayer.username].mana;

                    // update known orbs
                    this.thisPlayer.knownOrbs = [];
                    for (let i = 0; i < this.thisPlayer.orbs; i++) {
                        let currentOrb = data.players[this.thisPlayer.username].orbs[i];
                        if (currentOrb['known'])
                            this.thisPlayer.knownOrbs.push(currentOrb);
                    }

                    // update the opposing player's gameboard
                    this.oppPlayer.frontLine = data.players[this.oppPlayer.username].frontLine;
                    this.oppPlayer.backLine = data.players[this.oppPlayer.username].backLine;
                    this.oppPlayer.support = data.players[this.oppPlayer.username].support;
                    this.oppPlayer.deck = data.players[this.oppPlayer.username].deck.length;
                    this.oppPlayer.retreat = data.players[this.oppPlayer.username].retreat;
                    this.oppPlayer.boundless = data.players[this.oppPlayer.username].boundless;
                    this.oppPlayer.orbs = data.players[this.oppPlayer.username].orbs.length;
                    this.oppPlayer.bonds = data.players[this.oppPlayer.username].bonds;
                    this.oppPlayer.hand = data.players[this.oppPlayer.username].hand.length;

                    // update known orbs
                    this.oppPlayer.knownOrbs = [];
                    for (let i = 0; i < this.oppPlayer.orbs; i++) {
                        let currentOrb = data.players[this.oppPlayer.username].orbs[i];
                        if (currentOrb['faceUp'])
                            this.oppPlayer.knownOrbs.push(currentOrb);
                    }

                    // grab non-player-specific info
                    this.phase = data.currentPhase;

                    // determine whose turn it is based on turn number and who went first
                    let a = (data.hostFirst) ? 1 : 0;
                    let b = (this.host) ? 1 : 0;
                    let c = data.currentTurn % 2;
                    this.turn = !!((a ^ b) ^ c);

                    if (this.turn) {
                        switch (data.currentPhase) {
                            case 0:
                                // beginning phase
                                this.beginningPhase(data);
                                break;
                            case 1:
                                // bond phase
                                this.bondPhase(data);
                                break;
                            case 2:
                                // deploy phase
                                this.deployPhase(data);
                                break;
                            case 3:
                                // action phase
                                this.actionPhase(data);
                                break;
                            case 4:
                                // end phase
                                this.endPhase(data);
                                break;
                        }
                    }
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
                this.thisPlayer.username = this.$store.state.userProfile.username;
                if (this.hostplayer.localeCompare(this.thisPlayer.username) === 0)
                    this.host = true;

                fb.roomsCollection.doc(this.hostplayer).get().then(function(room) {
                    let roomData = room.data();
                    thisComponent.otherplayer = roomData['other'];

                    if (thisComponent.host)
                        thisComponent.oppPlayer.username = roomData['other'];
                    else
                        thisComponent.oppPlayer.username = roomData['host'];

                });

                fb.roomsCollection.doc(this.hostplayer).onSnapshot(function(room) {
                    let roomData = room.data();
                    thisComponent.update(roomData);
                });

                // Initialize info panel (probably better to do a dummy initialization here instead)
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
            },
            deployUnit(card, source, dest, MC) {

                let newUnit = {
                    card: this.fetchCardData(card),
                    MC: MC,
                    stack: 1,
                    tapped: false
                };
                let boardref = this.thisPlayer;
                switch (source) {
                    case boardref.deck:
                        boardref.deck--;
                        // TODO update deck in database
                        break;
                    case boardref.hand:
                        // TODO update hand in database
                        break;
                }
                dest.push(JSON.parse(JSON.stringify(newUnit)));
                return newUnit;
            },
            setInfoCard(infoCard) {
                this.infoCard = infoCard;
            },
            shuffle(array) {
                var currentIndex = array.length, temporaryValue, randomIndex;

                // While there remain elements to shuffle...
                while (0 !== currentIndex) {

                    // Pick a remaining element...
                    randomIndex = Math.floor(Math.random() * currentIndex);
                    currentIndex -= 1;

                    // And swap it with the current element.
                    temporaryValue = array[currentIndex];
                    array[currentIndex] = array[randomIndex];
                    array[randomIndex] = temporaryValue;
                }

                return array;
            },
            _draw(array) {
                let toReturn = array[0];
                array.shift();
                return toReturn;
            },
            draw(num, data, updateData) {
                let deck = data.players[this.thisPlayer.username].deck;

                let hand = data.players[this.thisPlayer.username].hand;

                for (let i = 0; i < num; i++)
                    hand.push(this._draw(deck));

                let prefix = 'players.' + this.thisPlayer.username + '.';

                updateData[prefix + 'deck'] = deck;
                updateData[prefix + 'hand'] = hand;
            },
            async createUnit(id) {
                let promise = new Promise((resolve) => {
                    resolve(this.fetchCardData(id));
                });
                let cardData = await promise;
                return {
                    cards: [cardData],
                    MC: false,
                    tapped: false
                }
            },
            async fetchCardData(id) {
                if (!this.seenCards[id]) {
                    let promise = new Promise((resolve) => {
                        fb.cardsCollection.doc(id).get().then(function(doc) {
                            let data = doc.data();
                            data['id'] = doc.id;
                            resolve(data);
                        })
                    });
                    this.seenCards[id] = await promise;
                }
                return this.seenCards[id];
            },
            binaryYes() {
                this.binaryoption.active = false;
                this.binaryoption.yes();
            },
            binaryNo() {
                this.binaryoption.active = false;
                this.binaryoption.no();
            },
            addOrbs(num, known, faceUp) {
                let thisComponent = this;
                fb.roomsCollection.doc(thisComponent.hostplayer).get().then( function(doc) {
                    let data = doc.data();
                    let deck = data.players[thisComponent.thisPlayer.username].deck;

                    let orbs = data.players[thisComponent.thisPlayer.username].orbs;

                    thisComponent.shuffle(deck);
                    for (let i = 0; i < num; i++) {
                        let newOrb = {'cardID' : thisComponent._draw(deck)};
                        newOrb['known'] = known;
                        if (!faceUp)
                        newOrb['faceUp'] = faceUp;
                        orbs.push(newOrb);
                    }

                    let prefix = 'players.' + thisComponent.thisPlayer.username + '.';
                    let updateData;
                    updateData = {};

                    updateData[prefix + 'deck'] = deck;
                    updateData[prefix + 'orbs'] = orbs;

                    fb.roomsCollection.doc(thisComponent.hostplayer).update(updateData);
                });
            },
            startGame() {
                let updateData = {
                    currentTurn: 1,
                    currentPhase: 0
                };
                fb.roomsCollection.doc(this.hostplayer).update(updateData);
            },
            nextPhase() {
                if (this.communicating)
                    return;
                this.communicating = true;

                let thisComponent = this;
                this.centermessage = '';

                // get database state to modify
                fb.roomsCollection.doc(this.hostplayer).get().then(function (doc) {
                    let data = doc.data();

                    let updateData = {currentPhase: data.currentPhase+1};
                    let prefix='players.'+thisComponent.thisPlayer.username+'.';
                    switch (data.currentPhase) {
                        case 1:
                            updateData[prefix+'mana'] = data.players[thisComponent.thisPlayer.username].bonds.length;
                    }

                    fb.roomsCollection.doc(thisComponent.hostplayer).update(updateData).then(function() {
                        thisComponent.communicating = false;
                    });

                });
            },
            beginningPhase(data) {
                if (this.communicating)
                    return;
                // TODO skip draw if turn = 1
                this.communicating = true;
                let updateData = {};
                if (data['turn'] > 1)
                    this.draw(1, data, updateData);

                let frontLine = data.players[this.thisPlayer.username].frontLine;
                let backLine = data.players[this.thisPlayer.username].backLine;

                frontLine.forEach(function(unit) {
                    unit.tapped = false;
                });
                backLine.forEach(function(unit) {
                    unit.tapped = false;
                });
                updateData['currentPhase'] = 1;

                updateData['players.' + this.thisPlayer.username + '.frontLine'] = frontLine;
                updateData['players.' + this.thisPlayer.username + '.backLine']  = backLine;

                let thisComponent = this;
                fb.roomsCollection.doc(this.hostplayer).update(updateData).then(function() {
                    setTimeout(function() {
                        thisComponent.communicating = false;
                    }, 1000)
                })
            },
            bondPhase(data) {
                if (this.turn)
                    this.centermessage = 'click a card in your hand to bond it';
                data; // TODO remove if not needed
            },
            deployPhase(data) {
                this.centermessage = 'click a card in your hand to deploy/promote/level up';

                data; // TODO remove if not needed
            },
            actionPhase(data) {
                data; // TODO remove if not needed
            },
            endPhase(data) {
                let updateData = {
                    currentTurn: data['currentTurn'] + 1,
                    currentPhase: 0
                };
                fb.roomsCollection.doc(this.hostplayer).update(updateData);
            },
            handClick(index) {
                if (this.turn) {
                    switch (this.phase) {
                        case 1:
                            this.bondFromHand(index, true);
                            break;
                        case 2:
                            this.showDeployMenu(index);
                            break;
                    }
                }
            },
            bondFromHand(index, incPhase, faceDown) {
                // suppress duplicate calls
                if (this.communicating)
                    return;
                this.communicating = true;

                let thisComponent = this;
                this.centermessage = '';

                // get database state to modify
                fb.roomsCollection.doc(this.hostplayer).get().then(function (doc) {
                    let data = doc.data();
                    let hand = data.players[thisComponent.thisPlayer.username].hand;
                    let bonds = data.players[thisComponent.thisPlayer.username].bonds;
                    // create
                    let newBond = {
                        id: hand[index],
                        flipped: !!faceDown,
                        imageref: thisComponent.seenCards[hand[index]].imageref
                    };
                    bonds.push(newBond);

                    hand.splice(index, 1);

                    let updateData;
                    if(incPhase)
                        updateData = {currentPhase: data.currentPhase+1};
                    else
                        updateData = {};

                    let prefix = 'players.'+thisComponent.thisPlayer.username+'.';
                    updateData[prefix + 'hand'] = hand;
                    updateData[prefix + 'bonds'] = bonds;
                    if (incPhase)
                        updateData[prefix + 'mana'] = bonds.length;

                    fb.roomsCollection.doc(thisComponent.hostplayer).update(updateData).then(function() {
                        thisComponent.communicating = false;
                    });

                });
            },
            showDeployMenu(index) {
                if (this.optionmenu.active)
                    return;

                this.optionmenu.active = true;
                let thisComponent = this;
                fb.roomsCollection.doc(this.hostplayer).get().then(async function (doc) {
                    let data = doc.data();

                    let promise = new Promise((resolve) => {
                        resolve(thisComponent.fetchCardData(data.players[thisComponent.thisPlayer.username]
                            .hand[index]));
                    });
                    let cardData = await promise;
                    thisComponent.optionmenu.prompt = 'What would you like to do with ' + cardData.name + ': ' + cardData.title;
                    let frontLine = data.players[thisComponent.thisPlayer.username].frontLine;
                    let backLine = data.players[thisComponent.thisPlayer.username].backLine;
                    let mana = data.players[thisComponent.thisPlayer.username].mana;

                    // check if board already has a unit with the same name
                    let temp = frontLine.filter(function(unit) {
                        return unit.cards[0].name.localeCompare(cardData.name) === 0;
                    });
                    let sameNameOnBoard = temp.length > 0;
                    temp = backLine.filter(function(unit) {
                        return unit.cards[0].name.localeCompare(cardData.name) === 0;
                    });
                    sameNameOnBoard = sameNameOnBoard || temp.length > 0;

                    // check to see if we have the promotion cost
                    let meetsPromoCost = !!cardData['promotion'];
                    if (meetsPromoCost)
                        meetsPromoCost = cardData['promotion'] <= mana;

                    // check to see if we meet the deploy cost
                    let meetsDeployCost = cardData['cost'] <= mana;

                    let options = [];
                    if (meetsDeployCost && !sameNameOnBoard) {
                        options.push({
                            name: 'Deploy To Front Line',
                            onSelect: function () {
                                thisComponent.createUnit(cardData.id).then(function(newUnit) {
                                    let hand = data.players[thisComponent.thisPlayer.username].hand;
                                    let frontLine = data.players[thisComponent.thisPlayer.username].frontLine;

                                    frontLine.push(newUnit);
                                    hand.splice(index, 1);

                                    let updateData = {};
                                    let prefix = 'players.' + thisComponent.thisPlayer.username + '.';

                                    updateData[prefix+'hand'] = hand;
                                    updateData[prefix+'frontLine'] = frontLine;
                                    updateData[prefix+'mana'] = mana - cardData['cost'];


                                    fb.roomsCollection.doc(thisComponent.hostplayer).update(updateData);
                                });
                            }
                        });
                        options.push({
                            name: 'Deploy To Back Line',
                            onSelect: function () {
                                thisComponent.createUnit(cardData.id).then(function(newUnit) {
                                    let hand = data.players[thisComponent.thisPlayer.username].hand;
                                    let backLine = data.players[thisComponent.thisPlayer.username].backLine;

                                    backLine.push(newUnit);
                                    hand.splice(index, 1);

                                    let updateData = {};
                                    let prefix = 'players.' + thisComponent.thisPlayer.username + '.';

                                    updateData[prefix +'hand'] = hand;
                                    updateData[prefix+'backLine'] = backLine;
                                    updateData[prefix+'mana'] = mana - cardData['cost'];


                                    fb.roomsCollection.doc(thisComponent.hostplayer).update(updateData);
                                });
                            }
                        });
                    }
                    else if (sameNameOnBoard && meetsPromoCost)
                        options.push({
                            name: 'Promote',
                            onSelect: function() {
                                // TODO Promotion Implementation
                            }
                        });

                    if (sameNameOnBoard && meetsDeployCost)
                        options.push({
                            name: 'Level Up',
                            onSelect: function() {
                                // TODO Level Up Implementation
                            }
                        });

                    options.push({
                        name: 'Cancel',
                        onSelect: function() {}
                    });

                    thisComponent.optionmenu.options = options;
                });


            },
            unitClicked(line, index) {
                if (this.turn) {
                    switch (this.phase) {
                        case 3:
                            this.showActionMenu(line, index);
                            break;
                    }
                }
            },
            showActionMenu(line, index) {
                if (this.optionmenu.active)
                    return;

                this.optionmenu.active = true;
                let unit = line[index];
                let thisComponent = this;
                function validAttackLines(unit) {
                    let inFrontLine = line === thisComponent.thisPlayer.frontLine;
                    let canAttackFrontLine = false;
                    let canAttackBackLine = false;

                    switch (unit.cards[0].range) {
                        case "1":
                            canAttackFrontLine = inFrontLine;
                            break;
                        case "2":
                            canAttackFrontLine = !inFrontLine;
                            canAttackBackLine = inFrontLine;
                            break;
                        case "3":
                            canAttackBackLine = !inFrontLine;
                            break;
                        case "1-2":
                            canAttackFrontLine = true;
                            canAttackBackLine = inFrontLine;
                            break;
                        case "2-3":
                            canAttackFrontLine = !inFrontLine;
                            canAttackBackLine = true;
                            break;
                        case "1-3":
                            canAttackFrontLine = true;
                            canAttackBackLine = true;
                            break;
                        case "-":
                            break;
                    }

                    return [canAttackFrontLine, canAttackBackLine];
                }
                fb.roomsCollection.doc(this.hostplayer).get().then(function(doc)
                {
                    let data = doc.data();
                    let tapped = unit.tapped;

                    let validLines = validAttackLines(unit);
                    let canAttackFrontLine = validLines[0] && this.oppPlayer.frontLine.length > 0;
                    let canAttackBackLine = validLines[1] && this.oppPlayer.backLine.length > 0;

                    let canAttack = !tapped && (canAttackFrontLine || canAttackBackLine) && data['currentTurn'] > 1;
                    let canMove = !tapped;

                    let options = [];

                    if (canAttack) {
                        options.push({
                            name: 'Attack',
                            onSelect: function () {
                                // TODO : select target
                            }
                        })
                    }
                    if (canMove) {
                        options.push({
                            name: 'Move',
                            onSelect: function () {
                                // TODO : tap and change lines
                            }
                        })
                    }
                    options.push({
                        name: 'Cancel',
                        onSelect: function () {
                        }
                    });

                    thisComponent.optionmenu.options = options;
                    thisComponent.optionmenu.prompt = 'What would you like to do with ' + unit.cards[0].name + ': ' +
                        unit.cards[0].title;
                });
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
        min-height:80px;
        overflow-x: scroll;
    }
    .opp {
        grid-area: oppo;
        min-height: 80px;
        overflow-x: scroll;
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

    .phasebutton {
        width: 20%;
        min-width: 70px;
        padding: 2px;
    }

    .playarea >>> tr {
        height: 80px;
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