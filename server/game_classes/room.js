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
    }

    addPlayer(name, socket) {
        if (this.players[1] == null) {
            this.players[1] = new Player(name, socket, false);
            return true;
        } else {
            return false;
        }
    }

    getPlayer(name) {
        if (this.players[0].name === name) {
            return this.players[0];
        } else if (this.players[1].name === name) {
            return this.players[1]
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

        if (hostWin === null) {
            this.players[0].rps = 'n';
            this.players[1].rps = 'n';
        }
        else if (hostWin) {
            this.firstPlayer = this.players[0];
        } else {
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


}
exports.Room = Room;
