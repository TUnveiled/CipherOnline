const OrbArea = require("./orbarea").OrbArea;
const BondArea = require("./bondarea").BondArea;
const Deck = require('./deck').Deck;
const Line = require('./line').Line;
const Unit = require('./unit').Unit;
const Hand = require('./hand').Hand;
// eslint-disable-next-line no-unused-vars
class Player {
    // eslint-disable-next-line no-unused-vars
    constructor(name, socket, isHost, room) {
        this.name = name;
        this.room = room;
        this.socket = socket;
        this.isHost = isHost;
        this.isReady = false;
        this.orbArea = new OrbArea();
        this.retreat = null;
        this.boundless = null;
        this.deck = null;
        this.mana = 0;
        this.hand = new Hand();
        this.frontline = new Line();
        this.backline = new Line();
        this.bondarea = new BondArea();
        this.rps = 'n';
        this.MC = null;
        this.optionResults = [];
        this.options = {};
        this.storedIndex = null;
    }

    // eslint-disable-next-line no-unused-vars
    selectMC(index, params) {

        // add MC to front line
        let mc = this.deck.grab(index);

        this.frontline.deploy(this.MC = new Unit(mc, true));

        this.options.cardselect.options = [];
        this.optionResults = [];

        this.deck.shuffle();
        this.draw(6);

        // set up mulligan
        this.options = {
            uiType: 'binaryoption',
            binaryoption: {
                prompt: "Would you like to mulligan?"
            }
        };

        this.optionResults = [
            {func: "mulligan"},
            {func: "mulligan"}
        ];

        this.room.sendGameState();
    }

    draw(num) {
        for (let i = 0; i < num; i++) {
            this.hand.push(this.deck.draw());
        }
    }

    mulligan(num) {
        let len = this.hand.length();

        if (num === 0) {
            for (let i = 0; i < len; i++) {
                this.deck.push(this.hand.pop())
            }
            this.deck.shuffle();
            this.draw(6);
        }

        this.options = {uiType: ""};
        this.optionResults = [];

        // do the rest of the pre game setup

        // add 5 orbs
        for (let i = 0; i < 5; i++) {
            this.orbArea.push(this.deck.draw());
        }

        this.room.finishSetup();

        this.room.sendGameState();
    }

    selectResult(index) {
        let optionResult = this.optionResults[index];


        console.log(JSON.stringify(optionResult.func));

        switch (optionResult.func) {

            case "selectMC":
                this.selectMC(index, optionResult.params);
                break;

            case "mulligan":
                this.mulligan(index);
                break;

            case "bond":
                this.bond(index);
                break;

            case "deployoptions":
                this.sendDeployOptions(index);
                break;

            case "deployfront":
                this.deploy(this.frontline);
                break;

            case "deployback":
                this.deploy(this.backline);
                break;

            case "promote":
                this.promote();
                break;

            case "levelup":
                this.levelup();
                break;

            case "canceldeploy":
                this.deployHandSelect();
                break;

            case "null":
                this.options = {uiType: ""};
                this.optionResults = [];
                break;
        }
    }

    deploy(line) {
        let cardCopy = this.hand.grab(this.storedIndex);

        line.deploy(new Unit(cardCopy));

        this.mana -= cardCopy.get()['cost'];

        this.deployHandSelect();

    }

    promote() {
        let cardCopy = this.hand.grab(this.storedIndex);

        if (this.frontline.contains(cardCopy.get().name)) {
            this.frontline.levelup(cardCopy);
        } else if (this.backline.contains(cardCopy.get().name)) {
            this.backline.levelup(cardCopy);
        } else {
            return;
        }

        this.draw(1);

        this.mana -= cardCopy['promotion'];

        this.deployHandSelect();
    }

    levelup() {
        let cardCopy = this.hand.grab(this.storedIndex);

        if (this.frontline.contains(cardCopy.get().name)) {
            this.frontline.levelup(cardCopy);
        } else if (this.backline.contains(cardCopy.get().name)) {
            this.backline.levelup(cardCopy);
        } else {
            return;
        }

        this.mana -= cardCopy['cost'];

        this.deployHandSelect();
    }

    deployHandSelect() {
        console.log("running");
        this.options = {
            uiType: 'handselect',
            handselect: {
                message: 'click a card in your hand to deploy/promote/level up'
            },
        };

        this.optionResults = [];

        for (let i = 0; i <= this.hand.length(); i++) {
            this.optionResults.push({
                func: "deployoptions"
            })
        }

        this.room.sendGameState();
    }

    sendDeployOptions(index) {

        if (index === this.hand.model.length) {
            this.room.actionPhase();
            return;
        }

        this.storedIndex = index;

        let cardData = this.hand.model[index].get();

        console.log(JSON.stringify(cardData));

        this.options = {
            uiType: "optionmenu",
            optionmenu: {
                prompt: "What would you like to do with " + cardData.name,
                options: []
            }
        };

        this.optionResults = [];

        let meetsDeployCost = cardData['cost'] <= this.mana;
        let meetsPromoCost = cardData['promotion'] && cardData.promotion <= this.mana;
        let isDeployed = this.backline.contains(cardData.name) || this.frontline.contains(cardData.name);

        if (meetsDeployCost && !isDeployed) {
            this.options.optionmenu.options.push("Deploy To Front Line");
            this.options.optionmenu.options.push("Deploy To Back Line");
            this.optionResults.push({
                func: "deployfront"
            });
            this.optionResults.push({
                func: "deployback"
            });
        }

        if (meetsDeployCost && isDeployed) {
            this.options.optionmenu.options.push("Level Up");
            this.optionResults.push({
                func: "levelup"
            });
        }

        if (meetsPromoCost && isDeployed) {
            this.options.optionmenu.options.push("Promote");
            this.optionResults.push({
                func: "promote"
            });
        }

        this.options.optionmenu.options.push("Cancel");
        this.optionResults.push({
            func: "canceldeploy"
        });

        this.room.sendGameState();
    }

    initializeDeck(fb, activeCards) {
        this.deck = new Deck(fb, activeCards);
    }

    untapAll() {
        this.frontline.untapAll();
        this.backline.untapAll();
    }

    bond(index, special) {
        // move card from hand to bonds
        this.bondarea.push(this.hand.grab(index));

        // in the average case, advance to deploy phase directly after bonding
        if (!special) {
            this.room.deployPhase();
        }
    }
}

exports.Player = Player;