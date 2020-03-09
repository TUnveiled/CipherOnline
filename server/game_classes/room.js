var Player = require('./player').Player;
// eslint-disable-next-line no-unused-vars
class Room {
    constructor(host, name, hostSocket, activeCards) {
        this.name = name;
        this.players = [new Player(host, hostSocket, true, this), null];
        this.inProgress = false;
        this.currentTurn = -1;
        this.currentPhase = -1;
        this.activeCards = activeCards;
        this.firstPlayer = null;
        this.turnPlayer = null;
    }

    addPlayer(name, socket) {
        if (this.players[1] == null) {
            this.players[1] = new Player(name, socket, false, this);
            return true;
        } else {
            return false;
        }
    }

    getPlayer(name) {
        if (this.players[0].name === name) {
            return this.players[0];
        } else if (this.players[1].name === name) {
            return this.players[1];
        } else {
            return null;
        }
    }

    checkRPS() {
        let hostWin = null;

        if (this.players[0].rps === 'n' || this.players[1].rps === 'n') {
            return false;
        }

        switch (this.players[0].rps) {
            case 'r':
                if (this.players[1].rps === 'p')
                    hostWin = false;
                else if (this.players[1].rps === 's')
                    hostWin = true;
                break;
            case 'p':
                if (this.players[1].rps === 'r')
                    hostWin = true;
                else if (this.players[1].rps === 's')
                    hostWin = false;
                break;
            case 's':
                if (this.players[1].rps === 'p')
                    hostWin = true;
                else if (this.players[1].rps === 'r')
                    hostWin = false;
                break;
        }

        if (hostWin == null) {
            this.players[0].rps = 'n';
            this.players[1].rps = 'n';
        }
        else if (hostWin) {
            // eslint-disable-next-line no-console
            console.log("win1");
            this.firstPlayer = this.players[0];
        } else {
            // eslint-disable-next-line no-console
            console.log("win2");
            this.firstPlayer = this.players[1];
        }

        return true;
    }

    isReady(num) {
        if (this.players[num])
            return this.players[num].isReady;
        else
            return false;
    }

    bothReady(){
        return this.isReady(1) && this.isReady(0);
    }

    kick() {
        let temp = this.players[1];
        this.players[1] = null;

        return temp;
    }

    isFull() {
        return this.players[1] == null;
    }

    getHostName() {
        if (this.players[0])
            return this.players[0].name;
        else
            return "";
    }

    getOtherName() {
        if (this.players[1])
            return this.players[1].name;
        else
            return "";
    }

    changeSocket(name, newSocket) {
        this.players.filter(function(player) {
            return name === player.name;
        })[0].socket = newSocket;
    }

    hostedBy(name) {
        return this.players[0].name === name;
    }

    readyPlayer(num) {
        this.players[num].isReady = !this.players[num].isReady;
    }

    containsUser(name) {
        return this.getOtherName() === name || this.hostedBy(name);
    }

    startGame(fb){
        this.inProgress = true;

        this.players[0].initializeDeck(fb, this.activeCards);
        this.players[1].initializeDeck(fb, this.activeCards);

    }

    finishSetup() {
        // if both players have completed their setup
        if (this.players[0].orbArea.getClientVersion() > 0 && this.players[1].orbArea.getClientVersion() > 0) {
            this.currentTurn = 1;
            this.turnPlayer = this.firstPlayer;
            this.beginningPhase();
        }
    }

    beginningPhase() {
        this.currentPhase = 0;

        if (this.currentTurn > 1) {
            this.turnPlayer.draw();
        }

        this.turnPlayer.untapAll();

        this.bondPhase();
    }

    bondPhase() {
        this.currentPhase = 1;

        let options = {
            uiType: 'handselect',
            handselect: {
                message: 'click a card in your hand to bond it'
            },
        };
        let player = this.turnPlayer;
        let deck = player.deck.get();

        player.optionResults = [];
        for (let j = 0; j < deck.length; j++) {
            player.optionResults.push({
                func: "bond"
            });
        }
        player.options = options;
    }

    deployPhase() {
        // TODO : deploy phase
        this.currentPhase = 2;
        this.sendGameState();
    }

    sendGameState() {
        for (let i = 0; i < 2; i++) {

            let thisIndex = i;
            let oppIndex = (i+1) % 2;

            // TODO actually make this work
            let thisPlayer = { // variables pertaining to the logged in player's game state
                frontLine: this.players[thisIndex].frontline.getClientVersion(), // array of "Unit" objects representing the front line
                backLine: this.players[thisIndex].backline.getClientVersion(), // array of "Unit" objects representing the back line
                // support: null, // id of the current supporting card
                deck: this.players[thisIndex].deck.get().length, // number of cards in the deck
                // retreat: [], // array of card IDs representing the retreat pile
                // boundless: [], // not currently used
                orbs: this.players[thisIndex].orbArea.getClientVersion(), // number of orbs remaining
                // knownOrbs: [], // number of orbs known to this player
                // faceUpOrbs: [],
                bonds: this.players[thisIndex].bondarea.getClientVersion(), // array representing this player's bonds
                hand: this.players[thisIndex].hand.getClientVersion()
            };

            let oppPlayer = {
                frontLine: this.players[oppIndex].frontline.getClientVersion(), // array of "Unit" objects representing the front line
                backLine: this.players[oppIndex].backline.getClientVersion(), // array of "Unit" objects representing the back line
                // support: null, // id of the current supporting card
                deck: this.players[oppIndex].deck.get().length, // number of cards in the deck
                // retreat: [], // array of card IDs representing the retreat pile
                // boundless: [], // not currently used
                orbs: this.players[oppIndex].orbArea.getClientVersion(), // number of orbs remaining
                // faceUpOrbs: [],
                bonds: this.players[oppIndex].bondarea.getClientVersion(), // array representing this player's bonds
                hand: this.players[oppIndex].hand.length()
            };

            if (this.currentTurn < 0)
                oppPlayer.frontLine = [];

            let response = {
                type: "gameData",
                contents: {
                    thisPlayer: thisPlayer,
                    oppPlayer: oppPlayer,
                    rps: this.players[thisIndex].rps,
                    turnNum: this.currentTurn,
                    phaseNum: this.currentPhase,
                    firstPlayer: (this.firstPlayer) ? this.firstPlayer.name : null,
                    options: this.players[thisIndex].options,
                }
            };

            this.players[i].socket.send(JSON.stringify(response));

        }
    }


}
exports.Room = Room;
