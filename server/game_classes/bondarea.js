const Bond = require('./bond').Bond;

class BondArea {

    constructor() {
        this.model = [];
    }

    push(card) {
        this.model.push(new Bond(card));
    }

    length() {
        return this.model.length;
    }

    getClientVersion() {
        let bonds = [];
        this.model.forEach(function (bond) {
            bonds.push(bond.getClientVersion())
        });

        return bonds;
    }

}

exports.BondArea = BondArea;