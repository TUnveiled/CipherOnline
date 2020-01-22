import Player from './player'
// eslint-disable-next-line no-unused-vars
export default class Room {
    constructor(host, name, hostSocket) {
        this.name = name;
        this.players = [new Player(host, hostSocket, true), null];
    }

    addPlayer(name, socket) {
        this.players[1] = new Player(name, socket, false);
    }

    changeSocket(name, newSocket) {
        this.players.filter(function(player) {
            return name === player.name;
        })[0].socket = newSocket;
    }
}
