const Orb = require('./orb').Orb;

class OrbArea {

    constructor() {
        this.model = [];
    }

    push(card) {
        this.model.push(new Orb(card));
    }

    pop(card) {
        card; // TODO
    }

    getClientVersion() {
        return this.model.length;
    }

}

exports.OrbArea = OrbArea;