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
        <div class="window" id="confirmwindow" :style="confirmwindow.active ? 'display:block' : 'display:none'">
            <h5 style="color:black">{{confirmwindow.message}}</h5>
            <button v-on:click="confirmWindowConfirm()">{{confirmwindow.button}}</button>
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
                <tr v-if="!infoCard['skills']"></tr>
                <tr v-else v-for="(skill, index) in infoCard['skills']" :key="index"><td colspan="2">
                    {{skill.name}} : [{{skill.suppType ? skill.suppType : ''}} {{skill.type}}] {{skill.desc}}
                </td></tr>
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
                        <div v-if="oppPlayer.retreat.count">
                            <cardstack title="Retreat" :count="oppPlayer.retreat.count"
                                       :imageref="oppPlayer.retreat.imageref"></cardstack>
                        </div>
                        <div v-else>
                            <cardstack title="Retreat" :count="0"></cardstack>
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
                        <cardstack v-if="oppPlayer.boundless[0]" title="Boundless" :count="oppPlayer.boundless.count" :imageref="oppPlayer.boundless.imageref"></cardstack>
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
                                    <unit v-if="seenCards[unit.cards[0]]" :oref="unit" :cardref="seenCards[unit.cards[0]]"
                                          :canselect="actionState.validTargets[index]"
                                          @hover="setInfoCard"
                                          @click="unitClicked(oppPlayer.frontLine, index)"></unit>
                                    <div v-else>
                                        <a v-if="fetchCardData(unit.cards[0]) || initialize()">Loading...</a>
                                    </div>

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
                        <div v-if="oppPlayer.support && oppPlayer.support !== '0'">
                            <div v-if="!seenCards[oppPlayer.support] && oppPlayer.support === '0'"><a v-if="fetchCardData(oppPlayer.support)">Support</a></div>
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
                        <button class="phasebutton" disabled :style="(phase === 0) ? 'background: ' + (turn ? 'lightgreen' : 'lightcoral')  : ''">
                            Beginning
                        </button>
                        <button class="phasebutton" disabled :style="(phase === 1) ? 'background: ' + (turn ? 'lightgreen' : 'lightcoral')  : ''">
                            Bond
                        </button>
                        <button class="phasebutton" :disabled="!turn || phase !== 1"
                                :style="(phase === 2) ? 'background: ' + (turn ? 'lightgreen' : 'lightcoral')  : ''" v-on:click="nextPhase">
                            Deploy
                        </button>
                        <button class="phasebutton" :disabled="!turn || phase !== 2"
                                :style="(phase === 3) ? 'background: ' + (turn ? 'lightgreen' : 'lightcoral')  : ''" v-on:click="nextPhase">
                            Action
                        </button>
                        <button class="phasebutton" :disabled="!turn || phase !== 3"
                                :style="(phase === 4) ? 'background: ' + (turn ? 'lightgreen' : 'lightcoral')  : ''" v-on:click="nextPhase">
                            End
                        </button>
                        <br>{{centermessage}}
                    </td>
                    <td>
                        <!-- Your Support Area -->
                        <div v-if="thisPlayer.support && thisPlayer.support !== '0'">
                            <div v-if="!seenCards[thisPlayer.support]"><a v-if="fetchCardData(thisPlayer.support)">Support</a></div>
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
                                    <a v-if="fetchCardData(unit.cards[0]) || initialize()">Loading...</a>
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
                        <cardstack v-if="thisPlayer.boundless[0]" title="Boundless" :count="thisPlayer.boundless.count" :imageref="thisPlayer.boundless.imageref"></cardstack>
                        <cardstack v-else title="Boundless" :count="0"></cardstack>
                    </td>
                    <td> <!-- Your Back Line -->
                        <table v-if="thisPlayer.backLine.length > 0"><tbody><tr>
                            <td style="width:50%;"></td>
                            <td v-for="(unit, index) in thisPlayer.backLine" :key="index">
                                <div v-if="!seenCards[unit.cards[0]]">
                                    <a v-if="fetchCardData(unit.cards[0]) || initialize()">Loading...</a>
                                </div>
                                <unit :oref="unit" :cardref="seenCards[unit.cards[0]]" @hover="setInfoCard" v-else
                                      @click="unitClicked(thisPlayer.backLine, index)"></unit>
                            </td>
                            <td style="width:50%;"></td>
                        </tr></tbody></table>
                        <a v-else>Back Line</a>
                    </td>
                    <td> <!-- Your Retreat Pile -->
                        <div v-if="thisPlayer.retreat.count">
                            <cardstack title="Retreat" :count="thisPlayer.retreat.count"
                                       :imageref="thisPlayer.retreat.imageref"></cardstack>
                        </div>
                        <div v-else>
                            <cardstack title="Retreat" :count="0"></cardstack>
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
                confirmwindow : {
                    active: false,
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
                    retreat: {
                        count: 0,
                        imageref: ""
                    }, // array of card IDs representing the retreat pile
                    boundless: {
                        count: 0,
                        imageref: ""
                    }, // not currently used
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
                    retreat: {
                        count: 0,
                        imageref: ""
                    }, // array of card IDs representing the retreat pile
                    boundless: {
                        count: 0,
                        imageref: ""
                    }, // not currently used
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
            initialize() {
                // wait for the system to fetch user data
                if (!this.$store.state.token) {
                    setTimeout(this.initialize, 100);
                    return;
                }
                else if (!this.$store.state.userProfile.username) {
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
                if (card['valid']) {
                    card['selected'] = !card['selected'];
                    if (card['selected'])
                        this.cardselect.numSelected++;
                    else
                        this.cardselect.numSelected--;
                }
            },
            confirmSelection() { // function that runs when the user completes their selection
                let results = [];
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

                pf.checkConnection(foo,this);

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
            updateSeenCards(id, cardData) {
                this.$set(this.seenCards, id, cardData);
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
                        // select the first option after each card in hand (to end deploy phase)
                        this.askDeployOptions(this.thisPlayer.hand.length);
                        break;

                    case 3:
                        // end action phase
                        this.askActionOptions(this.thisPlayer.backLine, this.thisPlayer.backLine.length);
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
        confirmWindowConfirm() {
                this.optionMenuSelect(0);
                this.confirmwindow.active = false;
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
                if (this.turn && !this.optionmenu.active) {
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

            selectAttackTarget(line, index) {

                let token = this.$store.state.token;
                let serverConnection = this.$store.state.connection;

                let trueIndex = index;
                if (line === this.oppPlayer.backLine) {
                    trueIndex += this.oppPlayer.frontLine.length;
                }

                if (!this.actionState.validTargets[trueIndex]) {
                    return;
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

                    case "confirmwindow":
                        this.confirmwindow = options.confirmwindow;
                        this.$set(this.confirmwindow, 'active', true);
                        break;

                }
            },
            updateGame(contents) {
                let temp;
                if (contents['thisPlayer']) {
                    temp = contents['thisPlayer'];
                    if (temp['frontLine']) {
                        this.thisPlayer.frontLine = temp['frontLine'];
                        for(let i = 0; i < temp['frontLine'].length; i++) {
                            if (!this.seenCards[temp['frontLine'][i].cards[0].id]) {
                                this.fetchCardData(temp['frontLine'][i].cards[0].id);
                            }
                        }
                    }
                    if (temp['backLine']) {
                        this.thisPlayer.backLine = temp['backLine'];
                        for(let i = 0; i < temp['backLine'].length; i++) {
                            if (!this.seenCards[temp['backLine'][i].cards[0].id])
                                this.fetchCardData(temp['backLine'][i].cards[0].id);
                        }
                    }
                    if (temp['support']) {
                        this.thisPlayer.support = temp['support'];
                        if (!this.seenCards[temp['support']] && temp['support'] !== '0')
                            this.fetchCardData(temp['support']);

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
                        for(let i = 0; i < temp['hand'].length; i++) {
                            if (!this.seenCards[temp['hand'][i].id])
                                this.fetchCardData(temp['hand'][i].id);
                        }
                    }
                }
                if (contents['oppPlayer']) {
                    temp = contents['oppPlayer'];
                    if (temp['frontLine']) {
                        this.oppPlayer.frontLine = temp['frontLine'];
                        for(let i = 0; i < temp['frontLine'].length; i++) {
                            if (!this.seenCards[temp['frontLine'][i].cards[0].id])
                                this.fetchCardData(temp['frontLine'][i].cards[0].id);
                        }
                    }
                    if (temp['backLine']) {
                        this.oppPlayer.backLine = temp['backLine'];
                        for(let i = 0; i < temp['backLine'].length; i++) {
                            if (!this.seenCards[temp['backLine'][i].cards[0].id])
                                this.fetchCardData(temp['backLine'][i].cards[0].id);
                        }
                    }
                    if (temp['support']) {
                        this.oppPlayer.support = temp['support'];
                        if (!this.seenCards[temp['support']] && temp['support'] !== '0')
                            this.fetchCardData(temp['support']);
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
                if (contents['firstPlayer']) {
                    this.first = this.thisPlayer.username === contents['firstPlayer'];
                }
                if (contents['turnNum']) {
                    this.turn = this.first && (contents['turnNum'] % 2 === 1)
                            || !this.first && (contents['turnNum'] % 2 === 0);
                }
                if (contents['phaseNum']) {
                    this.phase = contents['phaseNum'];
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

    .infopanel >>> td {
        font-size: 12px;
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