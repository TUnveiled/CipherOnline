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

    levelup (newCard) {
        this.cards.unshift(newCard);
    }

    untap() {
        this.tapped = false;
    }

    tap() {
        this.tapped = true;
    }

    canAttack() {
        return !this.tapped;
    }

    canMove() {
        return !this.tapped;
    }

    getName() {
        return this.cards[0].get().name;
    }
}

exports.Unit = Unit;