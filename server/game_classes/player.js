const OrbArea = require("./orbarea").OrbArea;
const BondArea = require("./bondarea").BondArea;
const Discard = require("./discard").Discard;
const Deck = require('./deck').Deck;
const Line = require('./line').Line;
const Unit = require('./unit').Unit;
const Hand = require('./hand').Hand;

class Player {

    // constructor
    constructor(name, socket, isHost, room) {
        this.name = name;               // Database username corresponding to this player
        this.room = room;               // The room object this player is playing in
        this.socket = socket;           // Socket being used to communicate with this player
        this.isHost = isHost;           // Boolean value representing whether this player created the room
        this.isReady = false;           // Boolean representing the ready status of the user
        this.orbArea = new OrbArea();   // Object representing this player's "orb" cards
        this.retreat = new Discard();   // Object representing this player's retreat pile
        this.boundless = new Discard(); // Object representing this player's boundless pile
        this.deck = null;               // Object representing this player's deck
        this.mana = 0;                  // The number of bonds available for deployment this turn
        this.hand = new Hand();         // Object representing the cards in the player's "hand"
        this.frontline = new Line();    // Object representing the player's front line, holds unit objects
        this.backline = new Line();     // Object representing the player's back line, holds unit objects
        this.bondarea = new BondArea(); // Object representing the player's bond area, holds bond objects
        this.support = null;            // Object representing the card (or lack thereof) in this player's support zone
        this.rps = 'n';                 // This player's choice in janken 'r' 'p' 's' or 'n' (for unchosen)
        this.MC = null;                 // Pointer to this player's MC unit
        this.optionResults = [];        // Array of strings representing the function to call based on this player's response
        this.options = {};              // Object representing the choice this user is being faced with
        this.storedIndex = null;        // Temporary variable used to store information across player responses
        this.noSelection = () => {};    // function that runs if the user responds with an empty array
        this.promiseFlag = false;
        this.skillFunc = () => {};
    }


    selectMC(index) {

        // retrieve the card the user chose as MC
        let mc = this.deck.grab(index);

        // add the MC to the front line
        this.frontline.deploy(this.MC = new Unit(mc, true));

        // Give the player their starting hand
        this.deck.shuffle();
        this.draw(6);

        // Give the player the option to trade their hand for a new one (once)
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

        // Send the state of the game to front end
        // TODO change this to only update the user who selected their MC
        this.room.sendGameState();
    }

    draw(num) {
        // add num cards from top of deck to hand
        for (let i = 0; i < num; i++) {
            this.hand.push(this.deck.draw());
            this.checkForEmptyDeck();
        }
    }

    async discard(num, message) {
        // ask the player what they'd like to discard to crit
        let options = {
            uiType: 'cardSelect',
            cardselect: {
                active: true, // whether the window is visible
                options: [], // the cards that can be selected
                min: (num <= this.hand.length()) ? num : this.hand.length(), // the minimum number of cards that need to be selected
                max: num, // the max number of cards that can be selected
                message: message, // prompt for selection
            },
        };


        this.optionResults = [];

        for (let j = 0; j < this.hand.length(); j++) {
            let card = this.hand.model[j].get();
            let option = {
                id: card['id'],
                valid: true,
                selected: false
            };

            options.cardselect.options.push(JSON.parse(JSON.stringify(option)));

            this.optionResults.push({
                func: "discard"
            });
        }
        this.options = options;

        let player = this;
        let completed = new Promise(function(resolve) {
            player.promiseFlag = false;

            setTimeout(function waitForFlag() {
                if (player.promiseFlag) {
                    resolve();
                } else {
                    setTimeout(waitForFlag, 50);
                }
            }, 50)

        });

        this.room.sendGameState();

        await completed;
    }

    finishDiscard(indices) {

        indices.sort();

        for (let i = indices.length - 1; i > -1; i--) {
            this.retreat.push(this.hand.grab(indices[i]));
        }

        this.options = {};
        this.optionResults = [];

        this.promiseFlag = true;
    }

    mulligan(skipMull) {

        // shuffle hand back into deck and draw that many cards back
        let len = this.hand.length();
        if (!skipMull) {
            for (let i = 0; i < len; i++) {
                this.deck.push(this.hand.pop())
            }
            this.deck.shuffle();
            this.draw(6);
        }

        // reset the UI (avoid sending the same question again)
        this.options = {uiType: ""};
        this.optionResults = [];

        // add 5 orbs (standard pre-game setup)
        for (let i = 0; i < 5; i++) {
            this.orbArea.push(this.deck.draw());
        }

        // tell the room that this player is ready to start
        this.room.finishSetup();

        this.room.sendGameState();
    }

    selectResult(indices) {
        // String representing the player's selection
        let index = indices;
        if (Array.isArray(indices))
            index = indices[0];

        let optionResult = this.optionResults[index];

        // switch to determine next steps
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

            case "getactions":
                this.sendActions(index);
                break;

            case "getpotattopt":
                this.sendAttackOptions();
                break;

            case "move":
                this.move();
                break;

            case "attacktarget":
                this.attackTarget(index);
                break;

            case "canceldeploy":
                this.deployHandSelect();
                break;

            case "crit":
                this.sendCritOptions(index);
                break;

            case "discardforcrit":
                this.crit(index);
                break;

            case "evade":
                this.sendEvadeOptions(index);
                break;

            case "discardforevade":
                this.evade(index);
                break;

            case "cancelact":
                this.actionUnitSelect();
                break;

            case "redirect":
                this.redirect();
                break;

            case "discard":
                this.finishDiscard(indices);
                break;

            case "skill":
                this.skillFunc(indices, this);
                break;

            case "null":
                this.options = {uiType: ""};
                this.optionResults = [];
                break;
        }
    }

    deploy(line) {
        // create new unit object from card in hand
        let cardCopy = this.hand.grab(this.storedIndex);
        line.deploy(new Unit(cardCopy));

        // update this player's mana
        this.mana -= cardCopy.get()['cost'];

        // ask user for further deploys
        this.deployHandSelect();
    }

    promote() {
        // remove the card from hand
        let cardCopy = this.hand.grab(this.storedIndex);

        // update the unit being promoted
        if (this.frontline.contains(cardCopy.get().name)) {
            this.frontline.levelup(cardCopy);
        } else if (this.backline.contains(cardCopy.get().name)) {
            this.backline.levelup(cardCopy);
        } else {
            return;
        }

        // free draw as per promotion rules
        this.draw(1);

        // update mana
        this.mana -= cardCopy.get()['promotion'];

        // ask user about further deploys
        this.deployHandSelect();
    }

    levelup() {
        // remove this card from hand
        let cardCopy = this.hand.grab(this.storedIndex);

        // update the unit being levelled up
        if (this.frontline.contains(cardCopy.get().name)) {
            this.frontline.levelup(cardCopy);
        } else if (this.backline.contains(cardCopy.get().name)) {
            this.backline.levelup(cardCopy);
        } else {
            return;
        }

        // update mana
        this.mana -= cardCopy.get()['cost'];

        // ask user about further deploys
        this.deployHandSelect();
    }

    deployHandSelect() {

        // Prompt the player to take their next option
        this.options = {
            uiType: 'handselect',
            handselect: {
                message: 'click a card in your hand to deploy or class change'
            },
        };

        // Create an array mapping possible responses from client to the action the server shhould take in response
        this.optionResults = [];
        for (let i = 0; i <= this.hand.length(); i++) {
            this.optionResults.push({
                func: "deployoptions"
            })
        }

        // update the players on front end
        this.room.sendGameState();
    }

    actionUnitSelect() {

        // Prompt the player to take an action
        this.options = {
            uiType: 'unitselect',
            unitselect: {
                message: 'click an allied unit in the play area to see the actions that unit can take',
                alliedUnits: true,
                enemyUnits: false
            },
        };

        // options to select each unit in their lines plus one to end the phase
        let lineLengths = this.frontline.length() + this.backline.length();
        this.optionResults = [];
        for (let j = 0; j <= lineLengths; j++) {
            this.optionResults.push({
                func: "getactions"
            });
        }

        // update the client side
        this.room.sendGameState();
    }

    sendDeployOptions(index) {

        // if they chose to end the phase (always the last option)
        if (index === this.hand.model.length) {
            this.room.actionPhase();
            return;
        }

        // store their choice for later
        this.storedIndex = index;

        // get the card data for this player
        let cardData = this.hand.model[index].get();

        // prompt the user for what they want to do with the card they selected
        this.options = {
            uiType: "optionmenu",
            optionmenu: {
                prompt: "What would you like to do with " + cardData.name,
                options: []
            }
        };

        // determine what the player can do with the card they've selected
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

        // update the front end
        this.room.sendGameState();
    }

    sendActions(index) {

        // received message to go to next phase
        if (index >= this.frontline.length() + this.backline.length()) {
            this.room.endPhase();
            return;
        }

        // store the unit they selected for later use
        this.storedIndex = index;

        // determine what unit corresponds to the response
        let inFrontLine = (index < this.frontline.length());
        let lineIndex = (inFrontLine) ? index : index - this.frontline.length();
        let selectedUnit = (inFrontLine) ? this.frontline.getUnit(lineIndex) :
                                             this.backline.getUnit(lineIndex);

        // prompt the user, asking what they wish to do with the unit they selected
        this.options = {
            uiType: "optionmenu",
            optionmenu: {
                prompt: "What would you like to do with " + selectedUnit.getName(),
                options: []
            }
        };

        // determine what this player can do with the unit they selected
        this.optionResults = [];

        let attackOptions = this.getAttackOptions(selectedUnit.cards[0].get(), inFrontLine);
        let canAttackFrontLine = attackOptions[0];
        let canAttackBackLine = attackOptions[1];
        let canAttack = selectedUnit.canAttack() ;

        if ((canAttackFrontLine || canAttackBackLine) && canAttack && this.room.currentTurn > 1) {
            this.options.optionmenu.options.push("Attack");
            this.optionResults.push({
                func: "getpotattopt"
            });
        }

        if (selectedUnit.canMove()) {
            this.options.optionmenu.options.push("Move");
            this.optionResults.push({
                func: "move"
            });
        }

        this.options.optionmenu.options.push("Cancel");
        this.optionResults.push({
            func: "cancelact"
        });

        // update the front end
        this.room.sendGameState();
    }

    getSelectedUnit() {
        // get the unit object corresponding to the stored index
        let index = this.storedIndex;
        let inFrontLine = (index < this.frontline.length());
        let lineIndex = (inFrontLine) ? index : index - this.frontline.length();

        return (inFrontLine) ? this.frontline.getUnit(lineIndex) : this.backline.getUnit(lineIndex);
    }

    getAttackOptions(selectedUnitInfo, inFrontLine) {
        let canAttackFrontLine, canAttackBackLine;

        switch (selectedUnitInfo.range) {
            case "-":
                canAttackFrontLine = false;
                canAttackBackLine = false;
                break;
            case "1":
                canAttackFrontLine = inFrontLine;
                canAttackBackLine = false;
                break;
            case "2":
                canAttackFrontLine = !inFrontLine;
                canAttackBackLine = inFrontLine;
                break;
            case "3":
                canAttackBackLine = !inFrontLine;
                canAttackFrontLine = false;
                break;
            case "1-2":
                canAttackFrontLine = true;
                canAttackBackLine = inFrontLine;
                break;
            case "1-3":
                canAttackFrontLine = true;
                canAttackBackLine = true;
                break;
            case "2-3":
                canAttackFrontLine = !inFrontLine;
                canAttackBackLine = true;
                break;
        }

        canAttackBackLine &= (this.room.getOtherPlayer(this.name).backline.length() > 0);

        return [canAttackFrontLine, canAttackBackLine];
    }

    initializeDeck(fb, activeCards) {
        // create deck object using database
        this.deck = new Deck(fb, activeCards);
    }

    untapAll() {
        this.frontline.untapAll();
        this.backline.untapAll();
    }

    bond(index, special) {
        // move card from hand to bonds

        if (index >= this.hand.length()) {
            this.room.deployPhase();
            return;
        }

        this.bondarea.push(this.hand.grab(index));

        // in the average case, advance to deploy phase directly after bonding
        if (!special) {
            this.room.deployPhase();
        }
    }

    sendAttackOptions() {

        let index = this.storedIndex;
        let inFrontLine = (index < this.frontline.length());
        // let backLine = !frontLine;

        let selectedUnit = this.getSelectedUnit();

        let attackOptions = this.getAttackOptions(selectedUnit.cards[0].get(), inFrontLine);
        let canAttackFrontLine = attackOptions[0];
        let canAttackBackLine = attackOptions[1];

        let enemyPlayer = this.room.getOtherPlayer(this.name);

        // prompt the user to determine what unit they'd like to target with their attack
        this.options = {
            uiType: 'unitselect',
            unitselect: {
                message: 'click the unit you would like to attack',
                alliedUnits: false,
                enemyUnits: true,
                validTargets: []
            },
        };


        this.optionResults = [];

        for (let j = 0; j < enemyPlayer.frontline.length(); j++) {
            this.options.unitselect.validTargets.push(canAttackFrontLine);
            this.optionResults.push({
                func: (canAttackFrontLine) ? "attacktarget" : "invalidtarget"
            });
        }

        for (let j = 0; j < enemyPlayer.backline.length(); j++) {
            this.options.unitselect.validTargets.push(canAttackBackLine);
            this.optionResults.push({
                func: (canAttackBackLine) ? "attacktarget" : "invalidtarget"
            });
        }

        // update the front end
        this.room.sendGameState();
    }

    move() {
        // find the unit to move
        let index = this.storedIndex;
        let inFrontLine = (index < this.frontline.length());
        let lineIndex = (inFrontLine) ? index : index - this.frontline.length();

        // tap and move the unit
        if (inFrontLine) {
            this.frontline.tap(lineIndex);
            this.backline.add(this.frontline.remove(lineIndex));
        } else {
            this.backline.tap(lineIndex);
            this.frontline.add(this.backline.remove(lineIndex));
        }

        // prompt the user to continue their action phase
        this.actionUnitSelect();
    }

    attackTarget(defenderIndex) {
        //let enemyPlayer = this.room.getOtherPlayer(this.name);


        // tap the unit that's attacking
        this.getSelectedUnit().tap();

        // allow the room to continue with the attack sequence
        this.room.resolveAttack(this.storedIndex, defenderIndex);
    }

    async flipForSupport() {
        // move top card to support zone
        this.support = this.deck.draw();

        // check for empty deck
        this.checkForEmptyDeck();

        let selectedUnit = this.getSelectedUnit();

        // check for successful support
        if (selectedUnit.getName() !== this.support.get().name) {
            selectedUnit.addModifier('attack', this.support.get().support);
            let suppSkill = this.support.getSuppSkill();
            if (suppSkill) {
                await suppSkill.effect(this);
            }
        }
    }

    sendCritOptions(skipCrit) {

        if (!skipCrit) {

            let selectedUnit = this.getSelectedUnit();

            // ask the player what they'd like to discard to crit
            let options = {
                uiType: 'cardSelect',
                cardselect: {
                    active: true, // whether the window is visible
                    options: [], // the cards that can be selected
                    min: 0, // the minimum number of cards that need to be selected
                    max: 1, // the max number of cards that can be selected
                    message: 'Select a card to discard to crit or select no cards to cancel', // prompt for selection
                },
            };


            this.optionResults = [];

            for (let j = 0; j < this.hand.length(); j++) {
                let card = this.hand.model[j].get();
                let option = {
                    id: card['id'],
                    valid: selectedUnit.checkName(card['name']),
                    selected: false
                };

                options.cardselect.options.push(JSON.parse(JSON.stringify(option)));

                this.optionResults.push({
                    func: "discardforcrit"
                });
            }
            this.options = options;

            // if they dont make a selection, assume they did not want to crit
            this.noSelection = () => {
                this.options = {};
                this.optionResults = [];

                // move on to evade step
                this.room.askEvade();
            };

            // update front end
            this.room.sendGameState();

        } else {
            this.options = {};
            this.optionResults = [];

            // move on to evade step
            this.room.askEvade();
        }

    }

    crit(handIndex) {

        let selectedUnit = this.getSelectedUnit();

        let selectedDiscard = this.hand.model[handIndex].get();

        // discard the selected card from hand, increase attack as per crit rules
        if (selectedUnit.checkName(selectedDiscard.name)) {
            this.retreat.push(this.hand.grab(handIndex));

            selectedUnit.modifiers['attack'] += selectedUnit.getAttack();
        }

        this.options = {};
        this.optionResults = [];

        // move on to evade step
        this.room.askEvade();
    }

    evade(handIndex) {
        let selectedUnit = this.getSelectedUnit();
        let evade = false;

        let selectedDiscard = this.hand.model[handIndex].get();

        // discard the selected card and continue damage calculation with evade modifier
        if (selectedUnit.checkName(selectedDiscard.name)) {
            this.retreat.push(this.hand.grab(handIndex));
            evade = true;
        }

        // reset prompts
        this.options = {};
        this.optionResults = [];

        // calculate final attack result
        this.room.mathAttackResult(evade);
    }

    sendEvadeOptions(skipEvade) {
        if (!skipEvade) {

            let selectedUnit = this.getSelectedUnit();

            // prompt user to select a card to discard to evade
            let options = {
                uiType: 'cardSelect',
                cardselect: {
                    active: true, // whether the window is visible
                    options: [], // the cards that can be selected
                    min: 0, // the minimum number of cards that need to be selected
                    max: 1, // the max number of cards that can be selected
                    message: 'Select a card to discard to evade or select no cards to cancel', // prompt for selection
                },
            };

            this.optionResults = [];

            for (let j = 0; j < this.hand.length(); j++) {

                let card = this.hand.model[j].get();
                let option = {
                    id: card['id'],
                    valid: selectedUnit.checkName(card['name']),
                    selected: false
                };

                options.cardselect.options.push(JSON.parse(JSON.stringify(option)));

                this.optionResults.push({
                    func: "discardforevade"
                });
            }
            this.options = options;

            // if they didnt make a selection, assume they did not wish to evade
            this.noSelection = () => {
                this.options = {};
                this.optionResults = [];

                // calculate final attack result
                this.room.mathAttackResult();
            };

            // update the front end
            this.room.sendGameState();

        } else {
            this.options = {};
            this.optionResults = [];

            this.room.mathAttackResult();
        }

    }

    destroySelectedUnit() {

        let index = this.storedIndex;
        let inFrontLine = (index < this.frontline.length());
        let lineIndex = (inFrontLine) ? index : index - this.frontline.length();

        let selectedUnit =  (inFrontLine) ? this.frontline.getUnit(lineIndex) :
            this.backline.getUnit(lineIndex);

        // take an orb if you can
        if (selectedUnit.mc) {
            if (this.room.effects.filter((effect) => effect.type === "doubleOrb").length && this.orbArea.length() > 1)
                this.takeOrb();
            return this.takeOrb();
        } else {
            let cards = selectedUnit.cards;

            // move the unit's cards to retreat
            for (let i = 0; i < cards.length; i++) {
                this.retreat.push(cards[i]);
            }

            // remove the unit from the line
            if (inFrontLine) {
                this.frontline.remove(lineIndex);
            } else {
                this.backline.remove(lineIndex);
            }
            return 1;
        }
    }

    discardSupport() {
        // clear the card in the support zone
        this.retreat.push(this.support);
        this.support = null;
    }

    takeOrb() {
        if (this.orbArea.length()) {
            // move the orb from the orb area to hand
            this.hand.push(this.orbArea.pop());
            return 1;
        } else {
            // lose the game if you cant take an orb you need to take
            this.room.lose(this);
            return 0;
        }
    }

    checkForEmptyDeck() {
        // if the deck is empty, replace the deck with the discard pile
        if (this.deck.length() === 0) {
            while (this.retreat.length())  {
                this.deck.push(this.retreat.pop());
            }

            this.deck.shuffle();

            // if both deck and discard pile are empty, the game ends
            if (this.deck.length() === 0) {
                this.room.lose(this);
            }
        }
    }

    checkForForcedMarch() {
        // front line can't be empty during opponent's turn
        // move back line to front
        if (this.frontline.length() === 0) {
            this.frontline = this.backline;
            this.backline = new Line();
        }
    }

    redirect() {
        this.room.removePlayer(this);

        this.socket.send(JSON.stringify({
            type: "route",
            contents: {
                destination: '/matchmaking'
            }
        }));
    }

}

exports.Player = Player;