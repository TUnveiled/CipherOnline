let CardCopy = require("./CardCopy").CardCopy;

class Deck {
    constructor(fb, activeCards, dref) {
        this.model = [];
        let deck = this;
        // get deck from database
        if (!dref)
            dref = fb.publicCollection.doc("Starter Deck 12: Three Houses");

        dref.get().then(function (doc) {
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
                            cardData.id = cardID;
                            activeCards.cardObj[cardID] = cardData;

                            if (cardData.skills) {
                                for (let i = 0; i < cardData.skills.length; i++) {
                                    if (!activeCards.skills[cardData.skills[i]]) {
                                        activeCards.skills[cardData.skills[i]] = require(`./skills/${cardData.skills[i]}`).skillObj;
                                    }
                                    cardData.skills[i] = activeCards.skills[cardData.skills[i]];
                                }
                            }

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

    draw() {
        return this.grab(0);
    }

    grab(index) {
        let temp = this.model[index];
        this.model.splice(index, 1);
        return temp;
    }

    push(element) {
        this.model.push(element);
    }

    shuffle() {
        let currentIndex = this.model.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = this.model[currentIndex];
            this.model[currentIndex] = this.model[randomIndex];
            this.model[randomIndex] = temporaryValue;
        }

    }

    length() {
        return this.model.length;
    }
}

exports.Deck = Deck;