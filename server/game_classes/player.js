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
        this.rps = null;
        this.MC = null;
    }

    async initializeDeck(fb, activeCards) {
        fb;
        activeCards;
        // TODO : Create deck object
        // get references from activeCards
        // etc. etc.
    }
}

exports.Player = Player;