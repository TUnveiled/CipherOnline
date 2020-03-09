class Orb {

    constructor(card) {
        this.card = card;
        this.faceup = false;
        this.known = false;
    }

    getCard() {
        return this.card;
    }

}

exports.Orb = Orb;