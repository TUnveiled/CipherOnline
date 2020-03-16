const Orb = require('./orb').Orb;

class OrbArea {

    constructor() {
        this.model = [];
    }

    push(card) {
        this.model.push(new Orb(card));
    }

    pop() {
        return this.model.pop().getCard(); // TODO
    }

    length() {
        return this.model.length;
    }

    getClientVersion() {
        return this.model.length;
    }

}

exports.OrbArea = OrbArea;