<template>
    <div class="grid-container">
        <div class="window" id="rps" :style="(rps) ? 'display:block' : 'display:none'">
            <!-- window used for rock-paper-scissors -->
            <button v-on:click="rpsPick('r')">ROCK</button>
            <button v-on:click="rpsPick('p')">PAPER</button>
            <button v-on:click="rpsPick('s')">SCISSORS</button>
        </div>
        <div class="window" id="cardselect" :style="(cardselect.active) ? 'display:block' : 'display:none'">
            <!-- window used to select a card from a list -->
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
                    <td v-for="(element, index) in cardselect.options" :key="index">
                        <img v-if="seenCards[element.id]" height="200px" :src="seenCards[element.id].imageref"
                             alt="" :style="
                         'opacity: ' + ((element.valid) ? 1 : 0.5) + ';' +
                         'border: ' + ((element.selected) ? '3px solid green' : '3px solid white') + ';' +
                         'border-radius: 12px;'
                        "
                        v-on:mouseenter="infoCard=fetchCardData(element.id)"
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
            <!-- window used for yes/no questions -->
            <h2 style="color:black">{{binaryoption.prompt}}</h2>
            <button v-on:click="binaryYes">yes</button>
            <button v-on:click="binaryNo">no</button>
        </div>
        <div class="window" id="optionmenu" :style="optionmenu.active ? 'display:block' : 'display:none'">
            <!-- window used to select from a variable number of options -->
            <h5 style="color:black">{{optionmenu.prompt}}</h5>
            <div v-for="(option, index) in optionmenu.options" :key="index">
            <button v-on:click="optionMenuSelect(index)">{{option}}</button>
            </div>
        </div>
        <div class="infopanel">
            <!-- Left Panel that describes the card stored as "infoCard" -->
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
            <!-- div displaying the number of cards in the opponent's hand -->
            <table>
                <tbody>
                <tr v-if="oppPlayer.hand > 0">
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
            <!-- table where the state of the game is displayed -->
            <table class="playarea">
                <tbody>
                <tr>
                    <td> <!-- Opponent's retreat pile -->
                        <div v-if="seenCards[oppPlayer.retreat[0]]">
                            <cardstack v-if="oppPlayer.retreat[0]" title="Retreat" :count="oppPlayer.retreat.length"
                                       :imageref="seenCards[oppPlayer.retreat[0]].imageref"></cardstack>
                        </div>
                        <div v-else>
                            <div v-if="oppPlayer.retreat.length === 0">
                                <cardstack title="Retreat" :count="0"></cardstack>
                            </div>
                            <div v-else-if="fetchCardData(oppPlayer.retreat[0])">Loading...</div>
                        </div>
                    </td>
                    <td> <!-- Opponent's back line -->
                        <div v-if="oppPlayer.backLine">
                        <table v-if="oppPlayer.backLine.length > 0"><tbody><tr>
                            <td style="width: 50%;"></td>
                            <td v-for="(unit, index) in oppPlayer.backLine" :key="index">
                                <div v-if="!seenCards[unit.cards[0]]">
                                    <a v-if="fetchCardData(unit.cards[0])">Loading...</a>
                                </div>
                                <unit :oref="unit" :cardref="seenCards[unit.cards[0]]"
                                      :canselect="actionState.validTargets[index - oppPlayer.frontLine.length]"
                                      @hover="setInfoCard" v-else
                                      @click="unitClicked(oppPlayer.backLine, index)"></unit>
                            </td>
                            <td style="width: 50%;"></td>
                        </tr></tbody></table>
                            <a v-else>Back Line</a>
                        </div>
                        <a v-else>Back Line</a>
                    </td>
                    <td> <!-- Opponent's Boundless Area -->
                        <cardstack v-if="oppPlayer.boundless[0]" title="Boundless" :count="oppPlayer.boundless.length" :imageref="oppPlayer.boundless[0]['imageref']"></cardstack>
                        <cardstack v-else title="Boundless" :count="0"></cardstack>
                    </td>
                    <td rowspan="2"> <!-- Opponent's Bond Area -->
                        <a v-if="!oppPlayer.bonds">Bonds</a>
                        <a v-else-if="oppPlayer.bonds.length === 0">Bonds</a>
                        <bondarea v-else :dataref="oppPlayer.bonds" @hover="setInfoCard"></bondarea>
                    </td>
                </tr>
                <tr>
                    <td> <!-- Opponent's Deck -->
                        <facedownstack title="Deck" :count="oppPlayer.deck"></facedownstack>
                    </td>
                    <td> <!-- Opponent's Front Line -->
                        <div v-if="oppPlayer">
                        <div v-if="oppPlayer.frontLine">
                            <table v-if="oppPlayer.frontLine.length > 0"><tbody><tr>
                                <td style="width: 50%;"></td>
                                <td v-for="(unit, index) in oppPlayer.frontLine" :key="index">
                                    <div v-if="!seenCards[unit.cards[0]]">
                                        <a v-if="fetchCardData(unit.cards[0])">Loading...</a>
                                    </div>
                                    <unit :oref="unit" :cardref="seenCards[unit.cards[0]]"
                                          :canselect="actionState.validTargets[index]"
                                          @hover="setInfoCard" v-else
                                          @click="unitClicked(oppPlayer.frontLine, index)"></unit>
                                </td>
                                <td style="width: 50%;"></td>
                            </tr></tbody></table>
                            <a v-else>Front Line</a>
                        </div>
                            <a v-else>Front Line</a>
                        </div>
                        <a v-else>Front Line</a>
                    </td>
                    <td>
                        <!-- Opponent's Orbs -->
                        <facedownstack title="Orbs" :count="oppPlayer.orbs"></facedownstack>
                    </td>
                </tr>
                <tr>
                    <td>
                        <!-- Opponent's Support Area -->
                        <div v-if="oppPlayer.support">
                            <div v-if="!seenCards[oppPlayer.support]"><a v-if="fetchCardData(oppPlayer.support)">Loading...</a></div>
                            <supportcard v-else :oref="seenCards[oppPlayer.support]"
                                         @hover="setInfoCard(seenCards[oppPlayer.support])"></supportcard>
                        </div>
                        <div v-else>
                            Support
                        </div>
                    </td>
                    <td>
                        <!-- Phase Buttons; Display current phase and allow phase to be changed
                             when appropriate -->
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
                        <button class="phasebutton" :disabled="!turn || phase !== 3 || attackState.active"
                                :style="(phase === 4) ? 'background: lightgreen;' : ''" v-on:click="nextPhase">
                            End
                        </button>
                        <br>{{centermessage}}
                    </td>
                    <td>
                        <!-- Your Support Area -->
                        <div v-if="thisPlayer.support">
                            <div v-if="!seenCards[thisPlayer.support]"><a v-if="fetchCardData(thisPlayer.support)">Loading...</a></div>
                            <supportcard v-else :oref="seenCards[thisPlayer.support]"
                                         @hover="setInfoCard(seenCards[thisPlayer.support])">></supportcard>
                        </div>
                        <div v-else>
                            Support
                        </div>
                    </td>
                </tr>
                <tr>
                    <td> <!-- Your Orbs -->
                        <facedownstack title="Orbs" :count="thisPlayer.orbs"></facedownstack>
                    </td>
                    <td style="width:75%"> <!-- Your Front Line -->
                        <div v-if="thisPlayer">
                        <div v-if="thisPlayer.frontLine">
                        <table v-if="thisPlayer.frontLine.length > 0"><tbody><tr>
                            <td style="width:50%;"></td>
                            <td v-for="(unit, index) in thisPlayer.frontLine" :key="index">
                                <div v-if="!seenCards[unit.cards[0]]">
                                    <a v-if="fetchCardData(unit.cards[0])">Loading...</a>
                                </div>
                                <unit :oref="unit" :cardref="seenCards[unit.cards[0]]" @hover="setInfoCard" v-else
                                      @click="unitClicked(thisPlayer.frontLine, index)"></unit>
                            </td>
                            <td style="width:50%;"></td>
                        </tr></tbody></table>
                        <a v-else>Front Line</a>
                        </div></div>
                    </td>
                    <td> <!-- Your Deck -->
                        <facedownstack title="Deck" :count="thisPlayer.deck"></facedownstack>
                    </td>
                    <td rowspan="2" style="width:25%;">
                        <!-- Your Bond Area -->
                        <a v-if="!thisPlayer.bonds">Bonds</a>
                        <a v-else-if="thisPlayer.bonds.length === 0">Bonds</a>
                        <bondarea v-else :dataref="thisPlayer.bonds" @hover="setInfoCard"></bondarea>
                    </td>
                </tr>
                <tr>
                    <td> <!-- Your Boundless Area -->
                        <cardstack v-if="thisPlayer.boundless[0]" title="Boundless" :count="thisPlayer.boundless.length" :imageref="thisPlayer.boundless[0]['imageref']"></cardstack>
                        <cardstack v-else title="Boundless" :count="0"></cardstack>
                    </td>
                    <td> <!-- Your Back Line -->
                        <table v-if="thisPlayer.backLine.length > 0"><tbody><tr>
                            <td style="width:50%;"></td>
                            <td v-for="(unit, index) in thisPlayer.backLine" :key="index">
                                <div v-if="!seenCards[unit.cards[0]]">
                                    <a v-if="fetchCardData(unit.cards[0])">Loading...</a>
                                </div>
                                <unit :oref="unit" :cardref="seenCards[unit.cards[0]]" @hover="setInfoCard" v-else
                                      @click="unitClicked(thisPlayer.backLine, index)"></unit>
                            </td>
                            <td style="width:50%;"></td>
                        </tr></tbody></table>
                        <a v-else>Back Line</a>
                    </td>
                    <td> <!-- Your Retreat Pile -->
                        <div v-if="seenCards[thisPlayer.retreat[0]]">
                            <cardstack v-if="thisPlayer.retreat[0]" title="Retreat" :count="thisPlayer.retreat.length"
                                       :imageref="seenCards[thisPlayer.retreat[0]].imageref"></cardstack>
                        </div>
                        <div v-else>
                            <div v-if="thisPlayer.retreat.length === 0">
                                <cardstack title="Retreat" :count="0"></cardstack>
                            </div>
                            <div v-else-if="fetchCardData(thisPlayer.retreat[0])">Loading...</div>
                        </div>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
        <div class="hand">
            <!-- Div for displaying the player's hand -->
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
    import Supportcard from "@/components/supportcard";
    const fb = require('../firebaseConfig');
    const pf = require("../publicFunctions.js");

    export default {
        name: "game.vue",
        components: {Supportcard, Cardstack, Facedownstack, Unit, Bondarea},
        data() {
            return {
                infoCard: {}, // card structure that's displayed on the left panel
                hostplayer: '', // name of the host of the game
                otherplayer: '', // name of the non-host player
                host: false, // whether the player logged in is the host
                first: null,
                rps: false, // whether the rps window is being displayed
                turn: false, // whether it's currently the logged-in player's turn
                attackState: { // struct for storing data about an attack
                    active: false, // whether an attack is currently happening
                    attack: 0, // attack power of the attacking player
                    defense: 0, // attack power of the defending player
                    canAttackFrontLine: false, // whether the unit attacking can attack the front line
                    canAttackBackLine: false, // whether the unit attacking can attack the back line
                    selectedAttacker: null, // the index of the unit attacking
                    attackingFrom: null, // the line of the unit attacking
                    selectedDefender: null, // the index of the unit being attacked
                    defendingFrom: null, // the line of the unit being attacked
                    step: -1 // 0 : declaration, 1 : skills,  2 : supp, 3 : supp skills, 4 : crit, 5 : evade, 6 : result
                },
                actionState: {
                    alliedUnits: false,
                    enemyUnits: false,
                    validTargets: []
                },
                mana: 0, // remaining mana of the turn player
                phase: -1, // the current phase of turn
                communicating: false, // variable often (poorly) used for synchronization
                centermessage: '', // message displayed in the center of the play area
                cardselect: { // variables pertaining to the cardselect window
                    active: false, // whether the window is visible
                    options: [], // the cards that can be selected
                    min: 0, // the minimum number of cards that need to be selected
                    max: 0, // the max number of cards that can be selected
                    message: '', // prompt for selection
                    numSelected: 0, // the number of options currently selected
                    confirm: null // the function that runs when the user completes their selection
                },
                binaryoption: { // variables pertaining to the binary option (yes/no) window
                    active: false, // is the window visible?
                    prompt: '', // what is the question?
                    yes: null, // what function should run if the user selects "yes"
                    no: null // what function should run if the user selects "no"
                },
                optionmenu: { // variables pertaining to the option menu (for a variable number of options)
                    active: false, // is the window visible
                    prompt: '', // what is the question?
                    options: [], // array of objects {string name, function onSelect}
                    select(index) { // function that runs
                        this.options[index].onSelect(); // run the option's unique function
                        // reset this object for the next time it's needed
                        this.active = false;
                        this.prompt = '';
                        this.options = [];
                    }
                },
                thisPlayer: { // variables pertaining to the logged in player's game state
                    username: '', // username of the logged in player
                    frontLine: [], // array of "Unit" objects representing the front line
                    backLine: [], // array of "Unit" objects representing the back line
                    support: null, // id of the current supporting card
                    deck: 0, // number of cards in the deck
                    retreat: [], // array of card IDs representing the retreat pile
                    boundless: [], // not currently used
                    orbs: 0, // number of orbs remaining
                    knownOrbs: [], // number of orbs known to this player
                    bonds: [], // array representing this player's bonds
                    hand: [] // array representing this player's hand
                },
                seenCards: { }, // object mapping card IDs to card data
                oppPlayer: { // variables pertaining to the opposition player's game state
                    username: '', // username of the opposition player
                    frontLine: [], // array of "Unit" objects representing the front line
                    backLine: [], // array of "Unit" objects representing the back line
                    support: null, // id of the current supporting card
                    deck: 0, // number of cards in the deck
                    retreat: [], // array of card IDs representing the retreat pile
                    boundless: [], // not currently used
                    orbs: 0, // number of orbs remaining
                    knownOrbs: [], // number of orbs known to this player
                    bonds: [], // array representing this player's bonds
                    hand: [] // array representing this player's hand
                }
            }
        },
        mounted() {
            this.initialize();
        },
        methods: {
            rpsPick(option) {

                let token = this.$store.state.token;
                let serverConnection = this.$store.state.connection;
                function foo() {
                    let message = {
                        type: "rps",
                        contents: {
                            token: token,
                            choice: option
                        }
                    };

                    serverConnection.send(JSON.stringify(message));
                }

                pf.checkConnection(foo, this);
                this.rps = false;
            },
            // update(data) { // called upon snapshot of room in database
            //
            //
            //     if (data['currentTurn'] < 0) { // setup
            //         // make changes to how the board is set up as it happens
            //         this.otherplayer = data['other'];
            //         if (data.players[this.thisPlayer.username].frontLine)
            //             this.thisPlayer.frontLine = data.players[this.thisPlayer.username].frontLine;
            //         else
            //             this.thisPlayer.frontLine = [];
            //
            //         if (data.players[this.thisPlayer.username].hand)
            //             this.thisPlayer.hand = data.players[this.thisPlayer.username].hand;
            //         else
            //             this.thisPlayer.hand = [];
            //
            //         if (data.players[this.thisPlayer.username].deck)
            //             this.thisPlayer.deck = data.players[this.thisPlayer.username].deck.length;
            //         else
            //             this.thisPlayer.deck = 0;
            //
            //         if (data.players[this.oppPlayer.username].deck)
            //             this.oppPlayer.deck = data.players[this.oppPlayer.username].deck.length;
            //         else
            //             this.oppPlayer.deck = 0;
            //
            //         if (data.players[this.oppPlayer.username].hand)
            //             this.oppPlayer.hand = data.players[this.oppPlayer.username].hand.length;
            //         else
            //             this.oppPlayer.hand = 0;
            //
            //         if (data.players[this.thisPlayer.username].orbs)
            //             this.thisPlayer.orbs = data.players[this.thisPlayer.username].orbs.length;
            //         if (data.players[this.oppPlayer.username].orbs)
            //             this.oppPlayer.orbs = data.players[this.oppPlayer.username].orbs.length;
            //
            //         if (this.oppPlayer.username) { // check if the opposition player's name is known yet
            //             if (data.players[this.oppPlayer.username].frontLine)
            //                 this.oppPlayer.frontLine = [{
            //                 // display a face-down card if the opponent has picked their MC
            //                     cards: [{
            //                         name: '?',
            //                         title: '?',
            //                         cost: 1,
            //                         attack: '?',
            //                         support: '?',
            //                         range: '?',
            //                         symbol: '?',
            //                         quote: '',
            //                         affinities: [],
            //                         imageref: "https://serenesforest.net/wiki/images/a/a7/PlaceHolder.png"
            //                     }],
            //                     MC: true,
            //                     tapped: false,
            //                     stack: 1
            //                 }];
            //             else
            //                 this.oppPlayer.frontLine = [] // otherwise don't
            //         }
            //
            //         if (data.players[this.thisPlayer.username].rps == null) {
            //             // display Rock Paper Scissors
            //             this.rps = true;
            //         }
            //         else if (data['hostFirst'] == null && this.host && data.players[this.otherplayer].rps != null) {
            //             // determine the winner of Rock Paper Scissors, as host
            //             let hostWin = null;
            //             switch (data.players[this.hostplayer].rps) {
            //                 case 'r':
            //                     if (data.players[this.otherplayer].rps === 'p')
            //                         hostWin = false;
            //                     else if (data.players[this.otherplayer].rps === 's')
            //                         hostWin = true;
            //                     break;
            //                 case 'p':
            //                     if (data.players[this.otherplayer].rps === 'r')
            //                         hostWin = true;
            //                     else if (data.players[this.otherplayer].rps === 's')
            //                         hostWin = false;
            //                     break;
            //                 case 's':
            //                     if (data.players[this.otherplayer].rps === 'p')
            //                         hostWin = true;
            //                     else if (data.players[this.otherplayer].rps === 'r')
            //                         hostWin = false;
            //                     break;
            //             }
            //             let updateData;
            //
            //             // tie, reset state so the players play again
            //             if (hostWin === null) {
            //                 updateData = {};
            //                 updateData['players.' + this.hostplayer + '.rps'] = null;
            //                 updateData['players.' + this.otherplayer + '.rps'] = null;
            //             }
            //             else // someone won
            //                 updateData = {hostFirst: hostWin};
            //
            //             fb.roomsCollection.doc(this.hostplayer).update(updateData);
            //         }
            //         else
            //         if (data.players[this.$store.state.userProfile.username].MC === null
            //             && !this.cardselect.active && data.hostFirst != null) {
            //             // display pick MC box
            //             this.cardselect.active = true;
            //             this.cardselect.max = 1;
            //             this.cardselect.min = 1;
            //             this.cardselect.message = 'Select your MC';
            //             let thisComponent = this;
            //             // function to set MC
            //             this.cardselect.confirm = function(selectedCards) {
            //                 let MC = {
            //                     cards: [selectedCards[0]],
            //                     MC: true,
            //                     tapped: false
            //                 };
            //
            //                 // set up this player's state in the database
            //                 let prefix = 'players.' + thisComponent.thisPlayer.username + '.';
            //                 let updateData;
            //                 updateData = {};
            //                 updateData[prefix + 'MC'] = MC.cards[0].name;
            //                 updateData[prefix + 'frontLine'] = [MC];
            //                 updateData[prefix + 'backLine'] = [];
            //                 updateData[prefix + 'support'] = null;
            //                 updateData[prefix + 'deck'] = [];
            //                 updateData[prefix + 'retreat'] = [];
            //                 updateData[prefix + 'boundless'] = [];
            //                 updateData[prefix + 'orbs'] = [];
            //                 updateData[prefix + 'bonds'] = [];
            //                 updateData[prefix + 'hand'] = [];
            //                 updateData['attackState'] = thisComponent.attackState;
            //
            //                 fb.roomsCollection.doc(thisComponent.hostplayer).update(updateData);
            //
            //                 // set up deck:
            //                 fb.publicCollection.doc("Starter Deck 12: Three Houses").get().then(function (doc) {
            //                     let cards = doc.data();
            //                     let deck = [];
            //                     delete cards['Preferred_MCs'];
            //
            //                     // Create the deck array
            //                     cards[MC.cards[0].id]--;
            //                     Object.keys(cards).forEach(function (nextCard) {
            //                         for (let i=0; i < cards[nextCard]; i++)
            //                             deck.push(nextCard);
            //                     });
            //                     // shuffle the deck
            //                     thisComponent.shuffle(deck);
            //
            //                     // draw 6 cards
            //                     let hand = [];
            //                     for (let i = 0; i < 6; i++)
            //                         hand.push(thisComponent._draw(deck));
            //
            //                     // update the database to reflect these changes
            //                     let updateData = {};
            //                     updateData[prefix + 'deck'] = deck;
            //                     updateData[prefix + 'hand'] = hand;
            //                     updateData[prefix + 'mulligan'] = false;
            //                     fb.roomsCollection.doc(thisComponent.hostplayer).update(updateData);
            //
            //                     // mulligan (optional reshuffle and redraw)
            //                     thisComponent.binaryoption.prompt = "would you like to mulligan?";
            //                     thisComponent.binaryoption.yes = function() {
            //                         fb.roomsCollection.doc(thisComponent.hostplayer).get().then( function(doc) {
            //                             let data = doc.data();
            //                             let deck = data.players[thisComponent.thisPlayer.username].deck;
            //
            //                             let hand = data.players[thisComponent.thisPlayer.username].hand;
            //                             deck = deck.concat(hand);
            //
            //                             hand = [];
            //                             thisComponent.shuffle(deck);
            //                             for (let i = 0; i < 6; i++)
            //                                 hand.push(thisComponent._draw(deck));
            //
            //                             let prefix = 'players.' + thisComponent.thisPlayer.username + '.';
            //                             let updateData;
            //                             updateData = {};
            //
            //                             updateData[prefix + 'deck'] = deck;
            //                             updateData[prefix + 'hand'] = hand;
            //                             updateData[prefix + 'mulligan'] = true;
            //
            //                             // TODO check mulligan property for security
            //                             fb.roomsCollection.doc(thisComponent.hostplayer).update(updateData);
            //                             thisComponent.addOrbs(5, false, false);
            //                         });
            //                     };
            //                     thisComponent.binaryoption.no = (function() {
            //                         let updateData = {};
            //                         let prefix = 'players.' + thisComponent.thisPlayer.username + '.';
            //                         updateData[prefix + 'mulligan'] = true;
            //
            //                         fb.roomsCollection.doc(thisComponent.hostplayer).update(updateData);
            //
            //                         thisComponent.addOrbs(5, false, false);
            //                     });
            //                     thisComponent.binaryoption.active = true;
            //                 });
            //
            //             };
            //
            //             // get deck from database
            //             fb.publicCollection.doc("Starter Deck 12: Three Houses").get().then(function (doc) {
            //                 let cards = doc.data();
            //                 thisComponent.deck = cards.length - 1;
            //
            //                 // get card data from database
            //                 Object.keys(cards).forEach(function (nextCard) {
            //                     // grab the number of each card
            //                     let num = cards[nextCard];
            //                     if (nextCard.localeCompare('Preferred_MCs') !== 0) {
            //                         fb.cardsCollection.doc(nextCard).get().then(function (cardDoc) {
            //                             let cardID = cardDoc.id;
            //                             let cardData = cardDoc.data();
            //                             // set up cardselect options for MC selection
            //                             cardData['id'] = cardID;
            //                             thisComponent.seenCards[cardID] = cardData;
            //                             cardData['valid'] = cardData['cost'] === 1;
            //                             cardData['selected'] = false;
            //                             // TODO implement preferred MCs
            //                             for (let i = 0; i < num; i++) {
            //                                 let instanceData = JSON.parse(JSON.stringify(cardData));
            //                                 instanceData['count'] = i;
            //                                 thisComponent.cardselect.options.push(instanceData);
            //                             }
            //                         });
            //                     }
            //
            //
            //                 });
            //
            //             });
            //         } else if (this.host && data.players[this.otherplayer].orbs.length > 0
            //                     && data.players[this.hostplayer].orbs.length > 0) {
            //             // ready to start the game
            //             this.startGame();
            //         }
            //     } else {
            //         // game has begun
            //
            //         // update this player's gameboard
            //         this.thisPlayer.frontLine = data.players[this.thisPlayer.username].frontLine;
            //         this.thisPlayer.backLine = data.players[this.thisPlayer.username].backLine;
            //         this.thisPlayer.support = data.players[this.thisPlayer.username].support;
            //         this.thisPlayer.deck = data.players[this.thisPlayer.username].deck.length;
            //         this.thisPlayer.retreat = data.players[this.thisPlayer.username].retreat;
            //         this.thisPlayer.boundless = data.players[this.thisPlayer.username].boundless;
            //         this.thisPlayer.orbs = data.players[this.thisPlayer.username].orbs.length;
            //         this.thisPlayer.bonds = data.players[this.thisPlayer.username].bonds;
            //         this.thisPlayer.hand = data.players[this.thisPlayer.username].hand;
            //         this.attackState = data.attackState;
            //         if (data.players[this.thisPlayer.username].mana)
            //             this.mana = data.players[this.thisPlayer.username].mana;
            //
            //         // update known orbs
            //         this.thisPlayer.knownOrbs = [];
            //         for (let i = 0; i < this.thisPlayer.orbs; i++) {
            //             let currentOrb = data.players[this.thisPlayer.username].orbs[i];
            //             if (currentOrb['known'])
            //                 this.thisPlayer.knownOrbs.push(currentOrb);
            //         }
            //
            //         // update the opposing player's gameboard
            //         if (data.players[this.oppPlayer.username]) {
            //             this.oppPlayer.frontLine = data.players[this.oppPlayer.username].frontLine;
            //             this.oppPlayer.backLine = data.players[this.oppPlayer.username].backLine;
            //             this.oppPlayer.support = data.players[this.oppPlayer.username].support;
            //             this.oppPlayer.deck = data.players[this.oppPlayer.username].deck.length;
            //             this.oppPlayer.retreat = data.players[this.oppPlayer.username].retreat;
            //             this.oppPlayer.boundless = data.players[this.oppPlayer.username].boundless;
            //             this.oppPlayer.orbs = data.players[this.oppPlayer.username].orbs.length;
            //             this.oppPlayer.bonds = data.players[this.oppPlayer.username].bonds;
            //             this.oppPlayer.hand = data.players[this.oppPlayer.username].hand.length;
            //         } else {
            //             setTimeout(this.update, 300, data);
            //         }
            //
            //
            //         // update known orbs
            //         this.oppPlayer.knownOrbs = [];
            //         for (let i = 0; i < this.oppPlayer.orbs; i++) {
            //             let currentOrb = data.players[this.oppPlayer.username].orbs[i];
            //             if (currentOrb['faceUp'])
            //                 this.oppPlayer.knownOrbs.push(currentOrb);
            //         }
            //
            //         // grab non-player-specific info
            //         this.phase = data.currentPhase;
            //
            //         // determine whose turn it is based on turn number and who went first
            //         let a = (data.hostFirst) ? 1 : 0;
            //         let b = (this.host) ? 1 : 0;
            //         let c = data.currentTurn % 2;
            //         this.turn = !!((a ^ b) ^ c);
            //
            //
            //             if (this.oppPlayer.frontLine.length === 0 && data.players[this.oppPlayer.username])
            //                 this.forcedMarch(data);
            //
            //             switch (data.currentPhase) {
            //                 case 0:
            //                     // beginning phase
            //                     if (this.turn)
            //                     this.beginningPhase(data);
            //                     break;
            //                 case 1:
            //                     // bond phase
            //                     if (this.turn)
            //                     this.bondPhase(data);
            //                     break;
            //                 case 2:
            //                     // deploy phase
            //                     if (this.turn)
            //                     this.deployPhase(data);
            //                     break;
            //                 case 3:
            //                     // action phase
            //                     this.actionPhase(data);
            //                     break;
            //                 case 4:
            //                     // end phase
            //                     if (this.turn)
            //                     this.endPhase(data);
            //                     break;
            //             }
            //
            //     }
            //
            // },
            initialize() {
                // wait for the system to fetch user data
                if (!this.$store.state.token) {
                    setTimeout(this.initialize, 100);
                    return;
                }
                else if (this.$store.state.userProfile.username.localeCompare("") === 0) {
                    setTimeout(this.initialize, 100);
                    return;
                }

                this.thisPlayer.username = this.$store.state.userProfile.username;

                let token = this.$store.state.token;
                let serverConnection = this.$store.state.connection;
                function foo() {
                    let message = {
                        type: "getGameData",
                        contents: {
                            token: token
                        }
                    };

                    serverConnection.send(JSON.stringify(message));
                }

                pf.checkConnection(foo, this);

            },
            select(card) { // used for the cardselect window when a card is clicked
                // TODO move to cardselect object
                if (card['valid']) {
                    card['selected'] = !card['selected'];
                    if (card['selected'])
                        this.cardselect.numSelected++;
                    else
                        this.cardselect.numSelected--;
                }
            },
            confirmSelection() { // function that runs when the user completes their selection
                // TODO move to cardselect object
                let results = []
                for(let i = 0; i < this.cardselect.options.length; i++){
                    if(this.cardselect.options[i].selected){
                        results.push(i);
                    }
                }

                let token = this.$store.state.token;
                let serverConnection = this.$store.state.connection;
                function foo() {
                    let message = {
                        type: "selection",
                        contents: {
                            token: token,
                            results: results
                        }
                    };

                    serverConnection.send(JSON.stringify(message));
                }

                pf.checkConnection(foo,this)

                // TODO replace with real things.


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
            setInfoCard(infoCard) {
                if (typeof infoCard === "string") {
                    if (this.seenCards[infoCard])
                        this.infoCard = this.seenCards[infoCard];
                    else
                        this.fetchCardData(infoCard);
                }
                else
                    this.infoCard = infoCard;
            },
            shuffle(array) {
                // TODO move this to somewhere more appropriate
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
            _draw(array) { // alot like pop
                let toReturn = array[0];
                array.shift();
                return toReturn;
            },
            draw(num, data, updateData) {
                // NOTE : does not work with other updates regarding deck, hand and retreat
                let deck = data.players[this.thisPlayer.username].deck;
                let retreat = data.players[this.thisPlayer.username].retreat;
                let hand = data.players[this.thisPlayer.username].hand;

                for (let i = 0; i < num; i++) {
                    hand.push(this._draw(deck));
                    if (deck.length === 0) {
                        deck = retreat;
                        retreat = [];
                    }
                }

                let prefix = 'players.' + this.thisPlayer.username + '.';

                updateData[prefix + 'deck'] = deck;
                updateData[prefix + 'hand'] = hand;
                updateData[prefix + 'retreat'] = retreat;
                return updateData;
            },
            async createUnit(id) { // constructor for unit object
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
                let serverConnection = this.$store.state.connection;
                function foo() {
                    let message = {
                        type: "getCardData",
                        contents: {
                            id: id
                        }
                    };
                     serverConnection.send(JSON.stringify(message));
                }
                //  gets card data from database if it isn't already stored
                if (!id)
                    return 1;
                if (!this.seenCards[id]) {

                    await pf.checkConnection(foo, this);

                    return null;
                }
                return this.seenCards[id];
            },
            binaryYes() {
                this.binaryoption.active = false;

                // send message to server
                let token = this.$store.state.token;
                let serverConnection = this.$store.state.connection;
                function foo() {
                    let message = {
                        type: "selection",
                        contents: {
                            token: token,
                            results: [0]
                        }
                    };

                    serverConnection.send(JSON.stringify(message));
                }

                pf.checkConnection(foo,this);


            },
            binaryNo() {
                this.binaryoption.active = false;

                // send message to server
                let token = this.$store.state.token;
                let serverConnection = this.$store.state.connection;
                function foo() {
                    let message = {
                        type: "selection",
                        contents: {
                            token: token,
                            results: [1]
                        }
                    };

                    serverConnection.send(JSON.stringify(message));
                }

                pf.checkConnection(foo,this);
            },
            nextPhase() {
                switch (this.phase) {
                    case 1:
                        // select the first option after each bond in hand (always to skip bonding)
                        this.bondFromHand(this.thisPlayer.hand.length);
                        break;

                    case 2:
                        this.askDeployOptions(this.thisPlayer.hand.length);
                        break;// endPhase
                }
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
                if (!data.attackState.step)
                    return;

                switch (data.attackState.step) {
                    case 2:
                            if (data.players[this.thisPlayer.username].support == null) {
                                // have yet to support
                                let deck = data.players[this.thisPlayer.username].deck;
                                let retreat = data.players[this.thisPlayer.username].retreat;
                                let support = this._draw(deck);
                                if (deck.length === 0) {
                                    deck = retreat;
                                    retreat = [];
                                }
                                let updateData = {};
                                let prefix = 'players.' + this.thisPlayer.username + '.';
                                updateData[prefix + 'deck'] = deck;
                                updateData[prefix + 'retreat'] = retreat;
                                updateData[prefix + 'support'] = support;
                                fb.roomsCollection.doc(this.hostplayer).update(updateData);
                                this.checkSupports(data);
                            } else {
                                this.checkSupports(data);
                            }

                        break;
                    case 4:
                        // crit
                        if (!this.turn)
                            return;
                        if (!this.communicating) {
                            this.communicating = true;
                            let attackerName;
                            let attack = data.attackState.attack;
                            let defenderName;
                            let defense = data.attackState.defense;
                            if (data.attackState.attackingFrom.localeCompare("f") === 0) {
                                // attacking from frontline
                                attackerName = data.players[this.thisPlayer.username].
                                    frontLine[data.attackState.selectedAttacker].cards[0].name;
                            } else {
                                // attacking from backline
                                attackerName = data.players[this.thisPlayer.username].
                                    backLine[data.attackState.selectedAttacker].cards[0].name;
                            }
                            if (data.attackState.defendingFrom.localeCompare("f") === 0) {
                                // defending from frontline
                                defenderName = data.players[this.oppPlayer.username].
                                    frontLine[data.attackState.selectedDefender].cards[0].name;
                            } else {
                                // defending from backline
                                defenderName = data.players[this.oppPlayer.username].
                                    backLine[data.attackState.selectedDefender].cards[0].name;
                            }

                            this.binaryoption.prompt = "Would you like to crit?\n" +
                                "Attacker : " + attackerName + " (" + attack + ")\n" +
                                "Defender : " + defenderName + " (" + defense + ")";
                            let thisComponent = this;
                            this.binaryoption.yes = function () {
                                thisComponent.cardselect.message = 'Choose a card to discard to crit or confirm' +
                                    ' without selecting a card to cancel';
                                thisComponent.cardselect.max = 1;
                                thisComponent.cardselect.min = 0;
                                thisComponent.cardselect.numSelected = 0;
                                thisComponent.cardselect.options = [];
                                data.players[thisComponent.thisPlayer.username].hand.forEach(function (cardID) {
                                    let option = JSON.parse(JSON.stringify(thisComponent.seenCards[cardID]));
                                    option.id = cardID;
                                    option.valid = option.name === attackerName;
                                    option.selected = false;
                                    thisComponent.cardselect.options.push(option);
                                });
                                thisComponent.cardselect.confirm = function (selectedCards) {
                                    if (selectedCards.length === 0) {
                                        thisComponent.binaryoption.no();
                                    } else {
                                        let retreat = data.players[thisComponent.thisPlayer.username].retreat;
                                        let hand = data.players[thisComponent.thisPlayer.username].hand;
                                        attack = 2 * attack;

                                        // discard
                                        for(let i = 0; i < hand.length; i++ ){
                                            if(hand[i].localeCompare(selectedCards[0].id) === 0){
                                                retreat.push(hand[i]);
                                                hand.splice(i,1);
                                                break;
                                            }
                                        }
                                        let prefix = 'players.'+thisComponent.thisPlayer.username+'.';
                                        let updateData = {
                                            'attackState.attack': attack,
                                            'attackState.step': 5
                                        };
                                        updateData[prefix+'hand'] = hand;
                                        updateData[prefix+'retreat'] = retreat;

                                        fb.roomsCollection.doc(thisComponent.hostplayer).update(updateData);
                                        thisComponent.communicating = false;
                                    }
                                };
                                thisComponent.cardselect.active=true;
                            };
                            this.binaryoption.no = function() {
                                let updateData = {
                                    'attackState.step': 5
                                };

                                fb.roomsCollection.doc(thisComponent.hostplayer).update(updateData);
                                thisComponent.communicating = false;
                            };
                            this.binaryoption.active = true;
                        }
                        break;
                    case 5:
                        // evade
                        if (this.turn)
                            return;
                        if (!this.communicating) {
                            this.communicating = true;
                            let attackerName;
                            let attack = data.attackState.attack;
                            let defenderName;
                            let defense = data.attackState.defense;
                            if (data.attackState.attackingFrom.localeCompare("f") === 0) {
                                // attacking from frontline
                                attackerName = data.players[this.oppPlayer.username].frontLine[data.attackState.selectedAttacker].cards[0].name;
                            } else {
                                // attacking from backline
                                attackerName = data.players[this.oppPlayer.username].backLine[data.attackState.selectedAttacker].cards[0].name;
                            }
                            if (data.attackState.defendingFrom.localeCompare("f") === 0) {
                                // defending from frontline
                                defenderName = data.players[this.thisPlayer.username].frontLine[data.attackState.selectedDefender].cards[0].name;
                            } else {
                                // defending from backline
                                defenderName = data.players[this.thisPlayer.username].backLine[data.attackState.selectedDefender].cards[0].name;
                            }

                            this.binaryoption.prompt = "Would you like to evade?\n" +
                                "Attacker : " + attackerName + " (" + attack + ")\n" +
                                "Defender : " + defenderName + " (" + defense + ")";
                            let thisComponent = this;
                            this.binaryoption.yes = function () {
                                thisComponent.cardselect.message = 'Choose a card to discard to evade or confirm' +
                                    ' without selecting a card to cancel';
                                thisComponent.cardselect.max = 1;
                                thisComponent.cardselect.min = 0;
                                thisComponent.cardselect.numSelected = 0;
                                thisComponent.cardselect.options = [];
                                data.players[thisComponent.thisPlayer.username].hand.forEach(function (cardID) {
                                    let option = JSON.parse(JSON.stringify(thisComponent.seenCards[cardID]));
                                    option.id = cardID;
                                    option.valid = option.name === defenderName;
                                    option.selected = false;
                                    thisComponent.cardselect.options.push(option);
                                });
                                thisComponent.cardselect.confirm = function (selectedCards) {
                                    if (selectedCards.length === 0) {
                                        thisComponent.binaryoption.no();
                                    } else {
                                        let retreat = data.players[thisComponent.thisPlayer.username].retreat;
                                        let hand = data.players[thisComponent.thisPlayer.username].hand;
                                        defense = -1;

                                        // discard
                                        for (let i = 0; i < hand.length; i++) {
                                            if (hand[i].localeCompare(selectedCards[0].id) === 0) {
                                                retreat.push(hand[i]);
                                                hand.splice(i, 1);
                                                break;
                                            }
                                        }
                                        let prefix = 'players.' + thisComponent.thisPlayer.username + '.';
                                        let updateData = {
                                            'attackState.defense': defense,
                                            'attackState.step': 6
                                        };
                                        updateData[prefix + 'hand'] = hand;
                                        updateData[prefix + 'retreat'] = retreat;

                                        fb.roomsCollection.doc(thisComponent.hostplayer).update(updateData);
                                        thisComponent.communicating = false;
                                    }
                                };
                                thisComponent.cardselect.active = true;
                            };
                            this.binaryoption.no = function () {
                                let updateData = {
                                    'attackState.step': 6
                                };

                                fb.roomsCollection.doc(thisComponent.hostplayer).update(updateData);
                                thisComponent.communicating = false;
                            };
                            this.binaryoption.active = true;
                        }
                        break;
                    case 6:
                        // result
                        if (this.turn) {
                            if (this.communicating)
                                return;
                            this.communicating = true;
                            let attack = data.attackState.attack;
                            let defense = data.attackState.defense;
                            let updateData = {
                                attackState: {
                                    active: false,
                                    attack: 0,
                                    defense: 0,
                                    canAttackFrontLine: false,
                                    canAttackBackLine: false,
                                    selectedAttacker: null,
                                    attackingFrom: null,
                                    selectedDefender: null,
                                    defendingFrom: null,
                                    step: -1
                                }
                            };
                            let thisPrefix = 'players.' + this.thisPlayer.username + '.';
                            let oppPrefix = 'players.' + this.oppPlayer.username + '.';
                            let thisRetreat = data.players[this.thisPlayer.username].retreat;
                            let oppRetreat = data.players[this.oppPlayer.username].retreat;
                            let thisSupport = data.players[this.thisPlayer.username].support;
                            let oppSupport = data.players[this.oppPlayer.username].support;
                            thisRetreat.push(thisSupport);
                            oppRetreat.push(oppSupport);
                            if (defense < 0 || defense > attack) {
                                // defender wins
                            } else {
                                // attacker wins
                                let defendingLine = data.attackState.defendingFrom;
                                let index = data.attackState.selectedDefender;
                                let wasFrontLine;
                                if (defendingLine === "f") {
                                    defendingLine = data.players[this.oppPlayer.username].frontLine;
                                    wasFrontLine = true;
                                } else {
                                    defendingLine = data.players[this.oppPlayer.username].backLine;
                                    wasFrontLine = false;
                                }
                                let destroyedUnit = defendingLine[index];

                                if (destroyedUnit.MC) {
                                    let orbs = data.players[this.oppPlayer.username].orbs;
                                    if (orbs.length === 0) {
                                        alert("You Win!");
                                        let thisComponent = this;
                                        fb.roomsCollection.doc(this.hostplayer).delete().then(function() {
                                            thisComponent.$router.push("/matchmaking");
                                        });
                                    } else {
                                        let hand = data.players[this.oppPlayer.username].hand;
                                        hand.push(this._draw(orbs).cardID);

                                        updateData[oppPrefix+'hand'] = hand;
                                        updateData[oppPrefix+'orbs'] = orbs;
                                    }
                                } else {
                                    for (let i = 0; i < destroyedUnit.cards.length; i++) {
                                        oppRetreat.push(destroyedUnit.cards[i].id);
                                    }
                                    defendingLine.splice(index, 1);

                                    if (wasFrontLine) {
                                        updateData[oppPrefix+'frontLine'] = defendingLine;
                                    } else {
                                        updateData[oppPrefix+'backLine'] = defendingLine;
                                    }
                                }
                            }

                            updateData[oppPrefix+'retreat'] = oppRetreat;
                            updateData[oppPrefix+'support'] = null;
                            updateData[thisPrefix+'retreat'] = thisRetreat;
                            updateData[thisPrefix+'support'] = null;

                            fb.roomsCollection.doc(this.hostplayer).update(updateData);
                            this.communicating = false;
                        }
                        break;
                }

            },
            handClick(index) {
                if (this.turn) {
                    switch (this.phase) {
                        case 1:
                            this.bondFromHand(index);
                            break;
                        case 2:
                            if (!this.optionmenu.active)
                                this.askDeployOptions(index);
                            break;
                    }
                }
            },

            askDeployOptions(index) {
                let token = this.$store.state.token;
                let serverConnection = this.$store.state.connection;
                function foo() {
                    let message = {
                        type: "selection",
                        contents: {
                            token: token,
                            results: [index]
                        }
                    };

                    serverConnection.send(JSON.stringify(message));
                }

                pf.checkConnection(foo, this);
                this.phase = -1;
                this.centermessage = "";
            },

            optionMenuSelect(index) {
                let token = this.$store.state.token;
                let serverConnection = this.$store.state.connection;
                function foo() {
                    let message = {
                        type: "selection",
                        contents: {
                            token: token,
                            results: [index]
                        }
                    };

                    serverConnection.send(JSON.stringify(message));
                }

                pf.checkConnection(foo, this);
                this.optionmenu.active = false;
            },

            bondFromHand(index) {
                let token = this.$store.state.token;
                let serverConnection = this.$store.state.connection;
                function foo() {
                    let message = {
                        type: "selection",
                        contents: {
                            token: token,
                            results: [index]
                        }
                    };

                    serverConnection.send(JSON.stringify(message));
                }

                pf.checkConnection(foo, this);
                this.phase = -1;
                this.centermessage = "";
            },

            unitClicked(line, index) {
                if (this.turn) {
                    switch (this.phase) {
                        case 3:
                            if ((line === this.thisPlayer.frontLine || line === this.thisPlayer.backLine)
                                    && this.actionState.alliedUnits)
                                this.askActionOptions(line, index);
                            else if ((line === this.oppPlayer.frontLine || line === this.oppPlayer.backLine)
                                    && this.actionState.enemyUnits)
                                this.selectAttackTarget(line, index);
                            break;
                    }
                }
            },

            askActionOptions(line, index) {
                let token = this.$store.state.token;
                let serverConnection = this.$store.state.connection;

                let trueIndex = index;
                if (line === this.thisPlayer.backLine) {
                    trueIndex += this.thisPlayer.frontLine.length;
                }

                function foo() {
                    let message = {
                        type: "selection",
                        contents: {
                            token: token,
                            results: [trueIndex]
                        }
                    };

                    serverConnection.send(JSON.stringify(message));
                }

                pf.checkConnection(foo, this);
                this.phase = -1;
                this.centermessage = "";
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
                    let canAttackFrontLine = validLines[0] && thisComponent.oppPlayer.frontLine.length > 0;
                    let canAttackBackLine = validLines[1] && thisComponent.oppPlayer.backLine.length > 0;

                    let canAttack = !tapped && (canAttackFrontLine || canAttackBackLine) && data['currentTurn'] > 1;
                    let canMove = !tapped;

                    let options = [];

                    if (canAttack) {
                        options.push({
                            name: 'Attack',
                            onSelect: function () {
                                let updateData = {
                                    "attackState.active": true,
                                    "attackState.canAttackBackLine": canAttackBackLine,
                                    "attackState.canAttackFrontLine": canAttackFrontLine,
                                    "attackState.attackingFrom": (line === thisComponent.thisPlayer.backLine) ?
                                        "b" : "f",
                                    "attackState.selectedAttacker": index,
                                    "attackState.step": 0
                                };
                                fb.roomsCollection.doc(thisComponent.hostplayer).update(updateData);
                            }
                        })
                    }
                    if (canMove) {
                        options.push({
                            name: 'Move',
                            onSelect: function () {
                                let frontLine = thisComponent.thisPlayer.frontLine;
                                let backLine = thisComponent.thisPlayer.backLine;
                                let unit;

                                if (line === frontLine) {
                                    unit = frontLine[index];
                                    unit.tapped = true;
                                    frontLine.splice(index,1);
                                    backLine.push(unit);
                                } else if (line === backLine) {
                                    unit = backLine[index];
                                    unit.tapped = true;
                                    backLine.splice(index, 1);
                                    frontLine.push(unit);
                                } else  {
                                    alert("An error occurred, try again");
                                    return;
                                }
                                let updateData = {};
                                let prefix = 'players.' + thisComponent.thisPlayer.username + '.';
                                updateData[prefix+'frontLine'] = frontLine;
                                updateData[prefix+'backLine'] = backLine;

                                fb.roomsCollection.doc(thisComponent.hostplayer).update(updateData);
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
            },
            selectAttackTarget(line, index) {

                let token = this.$store.state.token;
                let serverConnection = this.$store.state.connection;

                let trueIndex = index;
                if (line === this.oppPlayer.backLine) {
                    trueIndex += this.oppPlayer.frontLine.length;
                }

                function foo() {
                    let message = {
                        type: "selection",
                        contents: {
                            token: token,
                            results: [trueIndex]
                        }
                    };

                    serverConnection.send(JSON.stringify(message));
                }

                pf.checkConnection(foo, this);
                this.phase = -1;
                this.centermessage = "";
                this.actionState.enemyUnits = false;
                this.actionState.validTargets = [];

                // this.attackState.defendingFrom = (line === this.oppPlayer.backLine) ?
                //     "b" : "f";
                // this.attackState.selectedDefender = index;
                //
                // let attackState = JSON.parse(JSON.stringify(this.attackState));
                //
                // attackState.step = 2; // support
                //
                // let frontLine = this.thisPlayer.frontLine;
                // let backLine = this.thisPlayer.backLine;
                // let unit;
                //
                // if (attackState.attackingFrom.localeCompare("f") === 0) {
                //     unit = frontLine[this.attackState.selectedAttacker];
                //     unit.tapped = true;
                // } else if (attackState.attackingFrom.localeCompare("b") === 0) {
                //     unit = backLine[this.attackState.selectedAttacker];
                //     unit.tapped = true;
                // } else  {
                //     alert("An error occurred, try again");
                //     return;
                // }
                //
                // let updateData = {
                //     attackState: attackState
                // };
                // let prefix = 'players.' + this.thisPlayer.username + '.';
                // updateData[prefix+'frontLine'] = frontLine;
                // updateData[prefix+'backLine'] = backLine;
                //
                // fb.roomsCollection.doc(this.hostplayer).update(updateData);

            },
            checkSupports(data) {
                if (data.players[this.oppPlayer.username].support != null  &&
                    data.players[this.thisPlayer.username].support != null && this.turn
                    && this.seenCards[data.players[this.thisPlayer.username].support]
                    && this.seenCards[data.players[this.oppPlayer.username].support]) {
                    let attackingUnit;
                    let defendingUnit;
                    if (data.attackState.attackingFrom.localeCompare("f") === 0) {
                        // attacking from frontline
                        attackingUnit = data.players[this.thisPlayer.username].
                            frontLine[data.attackState.selectedAttacker].cards[0];
                    } else {
                        // attacking from backline
                        attackingUnit = data.players[this.thisPlayer.username].
                            backLine[data.attackState.selectedAttacker].cards[0];
                    }
                    if (data.attackState.defendingFrom.localeCompare("f") === 0) {
                        // defending from frontline
                        defendingUnit = data.players[this.oppPlayer.username].
                            frontLine[data.attackState.selectedDefender].cards[0];
                    } else {
                        // defending from backline
                        defendingUnit = data.players[this.oppPlayer.username].
                            backLine[data.attackState.selectedDefender].cards[0];
                    }
                    let attack = attackingUnit.attack;
                    let defense = defendingUnit.attack;
                    if (this.seenCards[data.players[this.thisPlayer.username].support].name !== attackingUnit.name)
                        attack += this.seenCards[data.players[this.thisPlayer.username].support].support;
                    if (this.seenCards[data.players[this.oppPlayer.username].support].name !== defendingUnit.name)
                        defense += this.seenCards[data.players[this.oppPlayer.username].support].support;

                    let updateData = {};
                    updateData['attackState.step'] = 4;
                    updateData['attackState.attack'] = attack;
                    updateData['attackState.defense'] = defense;
                    fb.roomsCollection.doc(this.hostplayer).update(updateData);

                } else {
                    setTimeout(this.checkSupports, 500, data);
                }
            },
            forcedMarch(data) {
                let opponentData = data.players[this.oppPlayer.username];
                let backLine = opponentData.backLine;
                let frontLine = backLine;
                backLine = [];

                let updateData = {};
                let prefix = 'players.' + this.oppPlayer.username + '.';
                updateData[prefix+'frontLine'] = frontLine;
                updateData[prefix+'backLine'] = backLine;

                fb.roomsCollection.doc(this.hostplayer).update(updateData);
            },
            async decipher(options) {
                let wait;
                let game = this;
                switch (options.uiType) {
                    case "cardSelect":

                        for(let i = 0; i < options.cardselect.options.length; i++) {
                            this.fetchCardData(options.cardselect.options[i].id);
                        }

                        wait = function() {
                            for (let i = 0; i < options.cardselect.options.length; i++) {
                                if (!game.seenCards[options.cardselect.options[i].id]) {
                                    setTimeout(wait, 50);
                                    return;
                                }
                                game.cardselect = options.cardselect;
                                game.cardselect.numSelected = 0;
                            }
                        };

                        wait();

                        break;

                    case "binaryoption":
                        options.binaryoption.active = true;
                        game.binaryoption = options.binaryoption;

                        break;

                    case "handselect":
                        this.centermessage = options.handselect.message;

                        break;

                    case "unitselect":
                        this.centermessage = options.unitselect.message;

                        this.actionState.alliedUnits = options.unitselect.alliedUnits;
                        this.actionState.enemyUnits = options.unitselect.enemyUnits;
                        if (this.actionState.enemyUnits) {
                            this.actionState.validTargets = options.unitselect.validTargets;
                        }
                        break;

                    case "optionmenu":
                        this.optionmenu.options = options.optionmenu.options;
                        this.optionmenu.prompt = options.optionmenu.prompt;
                        this.optionmenu.active = true;
                        break;
                }
            },
            updateGame(contents) {
                let temp;
                if (contents['thisPlayer']) {
                    temp = contents['thisPlayer'];
                    if (temp['frontLine']) {
                        this.thisPlayer.frontLine = temp['frontLine'];
                    }
                    if (temp['backLine']) {
                        this.thisPlayer.backLine = temp['backLine'];
                    }
                    if (temp['support']) {
                        this.thisPlayer.support = temp['support'];
                    }
                    if (temp['deck'] || temp['deck'] === 0) {
                        this.thisPlayer.deck = temp['deck'];
                    }
                    if (temp['retreat']) {
                        this.thisPlayer.retreat = temp['retreat'];
                    }
                    if (temp['boundless']) {
                        this.thisPlayer.boundless = temp['boundless'];
                    }
                    if (temp['orbs'] || temp['orbs'] === 0) {
                        this.thisPlayer.orbs = temp['orbs'];
                    }
                    if (temp['knownOrbs']) {
                        this.thisPlayer.knownOrbs = temp['knownOrbs'];
                    }
                    if (temp['faceUpOrbs']) {
                        this.thisPlayer.faceUpOrbs = temp['faceUpOrbs'];
                    }
                    if (temp['bonds']) {
                        this.thisPlayer.bonds = temp['bonds'];
                    }
                    if (temp['hand']) {
                        this.thisPlayer.hand = temp['hand'];
                    }
                }
                if (contents['oppPlayer']) {
                    temp = contents['oppPlayer'];
                    if (temp['frontLine']) {
                        this.oppPlayer.frontLine = temp['frontLine'];
                    }
                    if (temp['backLine']) {
                        this.oppPlayer.backLine = temp['backLine'];
                    }
                    if (temp['support']) {
                        this.oppPlayer.support = temp['support'];
                    }
                    if (temp['deck'] || temp['deck'] === 0) {
                        this.oppPlayer.deck = temp['deck'];
                    }
                    if (temp['retreat']) {
                        this.oppPlayer.retreat = temp['retreat'];
                    }
                    if (temp['boundless']) {
                        this.oppPlayer.boundless = temp['boundless'];
                    }
                    if (temp['orbs'] || temp['orbs'] === 0) {
                        this.oppPlayer.orbs = temp['orbs'];
                    }
                    if (temp['knownOrbs']) {
                        this.oppPlayer.knownOrbs = temp['knownOrbs'];
                    }
                    if (temp['faceUpOrbs']) {
                        this.oppPlayer.faceUpOrbs = temp['faceUpOrbs'];
                    }
                    if (temp['bonds']) {
                        this.oppPlayer.bonds = temp['bonds'];
                    }
                    if (temp['hand'] || temp['hand'] === 0) {
                        this.oppPlayer.hand = temp['hand'];
                    }
                }
                if (contents['rps']) {
                    if (contents.rps === 'n') {
                        // display Rock Paper Scissors
                        this.rps = true;
                    }
                }
                if (contents['options']) {
                   this.decipher(contents['options']);
                }
                if (contents['turnNum']) {
                    this.turn = this.first && (contents['turnNum'] % 2 === 1)
                            || !this.first && (contents['turnNum'] % 2 === 0);
                }
                if (contents['phaseNum']) {
                    this.phase = contents['phaseNum'];
                }
                if (contents['firstPlayer']) {
                    this.first = this.thisPlayer.username === contents['firstPlayer'];
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
        background: black;
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