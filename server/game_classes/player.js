var Deck = require('./deck').Deck;
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
        this.frontline = null;
        this.backline = null;
        this.bond = null;
        this.rps = 'n';
        this.MC = null;
    }

    initializeDeck(fb, activeCards) {
        this.deck = new Deck(fb, activeCards);
    }
}

exports.Player = Player;