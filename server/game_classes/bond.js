class Bond {

    constructor(card) {
        this.card = card;
        this.flipped = false;
    }

    getCard() {
        return this.card;
    }

    getClientVersion() {
        console.log({
            id: this.card.cardData.id,
            flipped: this.flipped,
            imageref: this.card.cardData.imageref
        });
        return {
            id: this.card.cardData.id,
            flipped: this.flipped,
            imageref: this.card.cardData.imageref
        };
    }

}

exports.Bond = Bond;