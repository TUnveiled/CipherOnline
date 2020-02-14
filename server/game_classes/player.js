var Deck = require('./deck').Deck;
var Line = require('./line').Line;
var Unit = require('./unit').Unit;
// eslint-disable-next-line no-unused-vars
class Player {
    // eslint-disable-next-line no-unused-vars
    constructor(name, socket, isHost, room) {
        this.name = name;
        this.room = room;
        this.socket = socket;
        this.isHost = isHost;
        this.isReady = false;
        this.orbArea = null;
        this.retreat = null;
        this.boundless = null;
        this.deck = null;
        this.hand = null;
        this.frontline = new Line();
        this.backline = new Line();
        this.bond = null;
        this.rps = 'n';
        this.MC = null;
        this.optionResults = [];
        this.options = [];
    }

    // eslint-disable-next-line no-unused-vars
    selectMC(index, params) {

        // add MC to front line

        let mc = this.deck.grab(index);

        this.frontline.deploy(this.MC = new Unit(mc, true));

        this.options = [];
        this.optionResults = [];

        this.room.sendGameState();

        return index; // TODO : do this
    }

    selectResult(index) {
        let optionResult = this.optionResults[index];
        
        optionResult.func(index, optionResult.params);
    }

    initializeDeck(fb, activeCards) {
        this.deck = new Deck(fb, activeCards);
    }
}

exports.Player = Player;