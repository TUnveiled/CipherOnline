var Player = require('./player').Player;
// eslint-disable-next-line no-unused-vars
class Room {
    constructor(host, name, hostSocket) {
        this.name = name;
        this.players = [new Player(host, hostSocket, true), null];
    }

    addPlayer(name, socket) {
        if (this.players[1] == null) {
            this.players[1] = new Player(name, socket, false);
            return true;
        } else {
            return false;
        }
    }

    isFull() {
        return this.players[1] == null;
    }

    getHostName() {
        return this.players[0].name;
    }

    changeSocket(name, newSocket) {
        this.players.filter(function(player) {
            return name === player.name;
        })[0].socket = newSocket;
    }

    hostedBy(name) {
        return this.players[0].name === name;
    }
}
exports.Room = Room;
