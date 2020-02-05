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
    }

    addPlayer(name, socket) {
        if (this.players[1] == null) {
            this.players[1] = new Player(name, socket, false);
            return true;
        } else {
            return false;
        }
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


}
exports.Room = Room;
