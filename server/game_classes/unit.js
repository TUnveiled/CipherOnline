var CardCopy = require('./CardCopy').CardCopy;

class Unit {
    constructor(card, mc=false) {
        this.cards = [card];
        this.mc = mc;
        this.tapped = false;
    }

    getClientVersion() {
        let temp = [];
        for (let i = 0; i < this.cards.length; i++)
            temp.push(this.cards[i].get().id);

        return {
            cards: temp,
            MC: this.mc,
            tapped: this.tapped
        }
    }

    untap() {
        this.tapped = false;
    }

    tap() {
        this.tapped = true;
    }
}

exports.Unit = Unit;