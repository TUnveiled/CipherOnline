class Unit {
    constructor(card, mc=false) {
        this.cards = [card];
        this.mc = mc;
        this.tapped = false;
        this.modifiers = {};
        /*
         * modifiers is a dictionary that describes how the unit currently differs from the text on the card
         * For example, having a modifier "attack" of 30 would increase that unit's attack by 30
         * Currently implemented modifiers:
         * attack: as described in the example
         */

    }

    getClientVersion() {
        let temp = [];
        for (let i = 0; i < this.cards.length; i++)
            temp.push(this.cards[i].get().id);

        return {
            cards: temp,
            MC: this.mc,
            tapped: this.tapped,
            modifiers: this.modifiers
        }
    }

    getAttack() {
        if (this.modifiers['attack'])
            return this.cards[0].get().attack + this.modifiers['attack'];
        else
            return this.cards[0].get().attack;
    }

    checkName(name) {
        return this.cards[0].get().name === name;
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

    addModifier(key, value) {
        this.modifiers[key] = value;
    }

    removeMod(key) {
        delete this.modifiers[key];
    }

    hasSymbol(symbol) {
        return this.cards[0].get().symbol === symbol;
    }
}

exports.Unit = Unit;