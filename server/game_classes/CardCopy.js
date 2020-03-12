
class CardCopy {
    constructor(ref) {
        this.cardData = ref;
    }

    get() {
        return this.cardData;
    }

    getClientVersionOfSupport() {
        return this.cardData.id;
    }
}

exports.CardCopy = CardCopy;