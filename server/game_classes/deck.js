let CardCopy = require("./CardCopy").CardCopy;

class Deck {
    constructor(fb, activeCards) {
        this.model = [];
        let deck = this;
        // get deck from database
        fb.publicCollection.doc("Starter Deck 12: Three Houses").get().then(function (doc) {
            let cards = doc.data();
            // TODO : send users deck length

            // get card data from database
            Object.keys(cards).forEach(function (nextCard) {
                // grab the number of each card
                let num = cards[nextCard];

                if (activeCards[nextCard]) {
                    for (let i = 0; i < num; i++) {
                        this.model.push(new CardCopy(activeCards[nextCard]));
                    }
                } else {
                    if (nextCard.localeCompare('Preferred_MCs') !== 0) {
                        fb.cardsCollection.doc(nextCard).get().then(function (cardDoc) {
                            let cardID = cardDoc.id;
                            let cardData = cardDoc.data();
                            cardData['id'] = cardID;
                            activeCards.cardObj[cardID] = cardData;

                            for (let i = 0; i < num; i++) {
                                deck.model.push(new CardCopy(activeCards.cardObj[cardID]));
                            }

                            // // set up cardselect options for MC selection
                            // cardData['id'] = cardID;
                            // cardData['valid'] = cardData['cost'] === 1;
                            // cardData['selected'] = false;
                            // // TODO implement preferred MCs
                            // for (let i = 0; i < num; i++) {
                            //     let instanceData = JSON.parse(JSON.stringify(cardData));
                            //     instanceData['count'] = i;
                            //     thisComponent.cardselect.options.push(instanceData);
                            // }
                        });
                    }
                }


            });

        });

    }

    get() {
        return this.model;
    }

    grab(index) {
        let temp = this.model[index];
        this.model.splice(index, 1);
        return temp;
    }
}

exports.Deck = Deck;