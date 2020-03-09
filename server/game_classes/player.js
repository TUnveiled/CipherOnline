const OrbArea = require("./orbarea").OrbArea;
const BondArea = require("./bondarea").BondArea;
const Deck = require('./deck').Deck;
const Line = require('./line').Line;
const Unit = require('./unit').Unit;
const Hand = require('./hand').Hand;
// eslint-disable-next-line no-unused-vars
class Player {
    // eslint-disable-next-line no-unused-vars
    constructor(name, socket, isHost, room) {
        this.name = name;
        this.room = room;
        this.socket = socket;
        this.isHost = isHost;
        this.isReady = false;
        this.orbArea = new OrbArea();
        this.retreat = null;
        this.boundless = null;
        this.deck = null;
        this.hand = new Hand();
        this.frontline = new Line();
        this.backline = new Line();
        this.bondarea = new BondArea();
        this.rps = 'n';
        this.MC = null;
        this.optionResults = [];
        this.options = {};
    }

    // eslint-disable-next-line no-unused-vars
    selectMC(index, params) {

        // add MC to front line
        let mc = this.deck.grab(index);

        this.frontline.deploy(this.MC = new Unit(mc, true));

        this.options.cardselect.options = [];
        this.optionResults = [];

        this.deck.shuffle();
        this.draw(6);

        // set up mulligan
        this.options = {
            uiType: 'binaryoption',
            binaryoption: {
                prompt: "Would you like to mulligan?"
            }
        };

        this.optionResults = [
            {func: "mulligan"},
            {func: "mulligan"}
        ];

        this.room.sendGameState();
    }

    draw(num) {
        for (let i = 0; i < num; i++) {
            this.hand.push(this.deck.draw());
        }
    }

    mulligan(num) {
        let len = this.hand.length();

        if (num === 0) {
            for (let i = 0; i < len; i++) {
                this.deck.push(this.hand.pop())
            }
            this.deck.shuffle();
            this.draw(6);
        }

        this.options = {uiType: ""};
        this.optionResults = [];

        // do the rest of the pre game setup

        // add 5 orbs
        for (let i = 0; i < 5; i++) {
            this.orbArea.push(this.deck.draw());
        }

        this.room.finishSetup();

        this.room.sendGameState();
    }

    selectResult(index) {
        let optionResult = this.optionResults[index];
        console.log("in selectresult");

        switch (optionResult.func) {

            case "selectMC":
                this.selectMC(index, optionResult.params);
                break;

            case "mulligan":
                this.mulligan(index);
                break;

            case "bond":
                console.log("made it to the switch");
                this.bond(index);
                break;

            case "null":
                this.options = {uiType: ""};
                this.optionResults = [];
                break;
        }
    }

    initializeDeck(fb, activeCards) {
        this.deck = new Deck(fb, activeCards);
    }

    untapAll() {
        this.frontline.untapAll();
        this.backline.untapAll();
    }

    bond(index, special) {
        // move card from hand to bonds
        this.bondarea.push(this.hand.grab(index));

        // in the average case, advance to deploy phase directly after bonding
        if (!special)
            this.room.deployPhase();
        this.options = {uiType: ""};
        this.optionResults = [];
    }
}

exports.Player = Player;