var Player = require('./player').Player;
// eslint-disable-next-line no-unused-vars
class Room {
    constructor(host, name, hostSocket, activeCards) {
        this.name = name;
        this.players = [new Player(host, hostSocket, true, this), null];
        this.inProgress = false;
        this.currentTurn = -1;
        this.currentPhase = -1;
        this.activeCards = activeCards;
        this.firstPlayer = null;
        this.turnPlayer = null;
    }

    addPlayer(name, socket) {
        if (this.players[1] == null) {
            this.players[1] = new Player(name, socket, false, this);
            return true;
        } else {
            return false;
        }
    }

    getPlayer(name) {
        if (this.players[0].name === name) {
            return this.players[0];
        } else if (this.players[1].name === name) {
            return this.players[1];
        } else {
            return null;
        }
    }

    checkRPS() {
        // calculate winner of rock-paper-scissors
        let hostWin = null;

        if (this.players[0].rps === 'n' || this.players[1].rps === 'n') {
            return false;
        }

        switch (this.players[0].rps) {
            case 'r':
                if (this.players[1].rps === 'p')
                    hostWin = false;
                else if (this.players[1].rps === 's')
                    hostWin = true;
                break;
            case 'p':
                if (this.players[1].rps === 'r')
                    hostWin = true;
                else if (this.players[1].rps === 's')
                    hostWin = false;
                break;
            case 's':
                if (this.players[1].rps === 'p')
                    hostWin = true;
                else if (this.players[1].rps === 'r')
                    hostWin = false;
                break;
        }

        if (hostWin == null) {
            this.players[0].rps = 'n';
            this.players[1].rps = 'n';
        }
        else if (hostWin) {
            this.firstPlayer = this.players[0];
        } else {
            this.firstPlayer = this.players[1];
        }

        return true;
    }

    isReady(num) {
        if (this.players[num])
            return this.players[num].isReady;
        else
            return false;
    }

    bothReady(){
        return this.isReady(1) && this.isReady(0);
    }

    kick() {
        let temp = this.players[1];
        this.players[1] = null;

        return temp;
    }

    isFull() {
        return this.players[1] == null;
    }

    getHostName() {
        if (this.players[0])
            return this.players[0].name;
        else
            return "";
    }

    getOtherName() {
        if (this.players[1])
            return this.players[1].name;
        else
            return "";
    }

    changeSocket(name, newSocket) {
        this.players.filter(function(player) {
            return name === player.name;
        })[0].socket = newSocket;
    }

    hostedBy(name) {
        return this.players[0].name === name;
    }

    readyPlayer(num) {
        this.players[num].isReady = !this.players[num].isReady;
    }

    containsUser(name) {
        return this.getOtherName() === name || this.hostedBy(name);
    }

    startGame(fb){
        this.inProgress = true;

        this.players[0].initializeDeck(fb, this.activeCards);
        this.players[1].initializeDeck(fb, this.activeCards);

    }

    finishSetup() {
        // if both players have completed their setup
        if (this.players[0].orbArea.getClientVersion() > 0 && this.players[1].orbArea.getClientVersion() > 0) {
            this.currentTurn = 1;
            this.turnPlayer = this.firstPlayer;
            this.beginningPhase();
        }
    }

    beginningPhase() {
        /**************************************************************************************************************
         * First Phase
         * Turn player draws a card (if it's not the first turn of the game)
         * Turn player untaps all their units
         * Any skills that trigger at the start of a turn trigger
         * Bond Phase begins
         **************************************************************************************************************/

        this.currentPhase = 0;

        this.getOtherPlayer(this.turnPlayer.name).checkForForcedMarch();

        if (this.currentTurn > 1) {
            this.turnPlayer.draw(1);
        }

        this.turnPlayer.untapAll();

        this.bondPhase();
    }

    bondPhase() {
        /**************************************************************************************************************
         * Second Phase
         * Turn player optionally moves one card from their hand to their bond area
         * Deploy phase begins
         **************************************************************************************************************/

        // set phase to correct value
        this.currentPhase = 1;

        let player = this.turnPlayer;

        // ask the user what card they'd like to bond
        player.options = {
            uiType: 'handselect',
            handselect: {
                message: 'click a card in your hand to bond it'
            },
        };

        let hand = player.hand.model;

        player.optionResults = [];

        // options to bond each card in their hand plus an option to skip
        for (let j = 0; j <= hand.length; j++) {
            player.optionResults.push({
                func: "bond"
            });
        }

        // update the front end (usually done when we want a response from a user)
        this.sendGameState();
    }

    deployPhase() {
        /**************************************************************************************************************
         * Third Phase
         * Turn Player receives "mana" equal to the number of bonds they have in their bond area
         * The player can spend that "mana" in three ways:
         * 1. Deploy a unit from their hand
         * 2. Use a card in their hand to level up a unit with the same name in one of their lines
         * 3. Use a card in their hand to promote a unit with the same name in one of their lines
         **************************************************************************************************************/

        // update phase value
        this.currentPhase = 2;

        // determine the player's starting mana
        this.turnPlayer.mana = this.turnPlayer.bondarea.length();

        // Function to prompt the user for their selection
        this.turnPlayer.deployHandSelect();
    }

    actionPhase() {
        /**************************************************************************************************************
         * Fourth Phase
         * Turn player can take any of the following actions
         * 1. Declare an attack
         * 2. Move a unit
         * 3. Use an applicable Action (ACT) skill
         **************************************************************************************************************/

        // update the phase value
        this.currentPhase = 3;

        // function to prompt the player to take an action
        this.turnPlayer.actionUnitSelect();
    }

    endPhase() {
        /**************************************************************************************************************
         * Fifth Phase
         * Progress to next turn
         * Change the turn player
         * Start back at the beginning phase
         **************************************************************************************************************/

        // update the phase
        this.currentPhase = 4;

        // move to the next turn
        this.currentTurn++;

        // reset the player's options (so they can't interact with the system while their opponent goes)
        this.turnPlayer.options = {};
        this.turnPlayer.optionResults = [];

        // change the turn player
        this.turnPlayer = this.getOtherPlayer(this.turnPlayer.name);

        // move back to beginning phase
        this.beginningPhase();
    }

    sendGameState() {
        for (let i = 0; i < 2; i++) {

            let thisIndex = i;
            let oppIndex = (i+1) % 2;

            let thisPlayer = { // state of the game on the user's side of the board
                frontLine: this.players[thisIndex].frontline.getClientVersion(),
                backLine: this.players[thisIndex].backline.getClientVersion(),
                support: (this.players[thisIndex].support) ? this.players[thisIndex].support.getClientVersionOfSupport() : "0",
                deck: this.players[thisIndex].deck.get().length,
                retreat: this.players[thisIndex].retreat.getClientVersion(),
                boundless: this.players[thisIndex].boundless.getClientVersion(),
                orbs: this.players[thisIndex].orbArea.getClientVersion(),
                bonds: this.players[thisIndex].bondarea.getClientVersion(),
                hand: this.players[thisIndex].hand.getClientVersion()
            };

            let oppPlayer = { // state of the game on the opponent's side of the board
                frontLine: this.players[oppIndex].frontline.getClientVersion(),
                backLine: this.players[oppIndex].backline.getClientVersion(),
                support: (this.players[oppIndex].support) ? this.players[oppIndex].support.getClientVersionOfSupport() : "0",
                deck: this.players[oppIndex].deck.get().length,
                retreat: this.players[oppIndex].retreat.getClientVersion(),
                boundless: this.players[oppIndex].boundless.getClientVersion(),
                orbs: this.players[oppIndex].orbArea.getClientVersion(),
                bonds: this.players[oppIndex].bondarea.getClientVersion(),
                hand: this.players[oppIndex].hand.length()
            };

            // do not display the opponent's MC until the game has started
            if (this.currentTurn < 0)
                oppPlayer.frontLine = [];

            let response = {
                type: "gameData",
                contents: {
                    thisPlayer: thisPlayer,
                    oppPlayer: oppPlayer,
                    rps: this.players[thisIndex].rps,
                    turnNum: this.currentTurn,
                    phaseNum: this.currentPhase,
                    firstPlayer: (this.firstPlayer) ? this.firstPlayer.name : null,
                    options: this.players[thisIndex].options,
                }
            };

            this.players[i].socket.send(JSON.stringify(response));

        }
    }

    getOtherPlayer(playerName) {
        if (playerName === this.players[0].name) {
            return this.players[1];
        } else {
            return this.players[0];
        }
    }

    resolveAttack(attackerIndex, defenderIndex) {
        let defendingPlayer = this.getOtherPlayer(this.turnPlayer.name);

        defendingPlayer.storedIndex = defenderIndex;

        // add support cards
        this.turnPlayer.flipForSupport();
        defendingPlayer.flipForSupport();

        // ask the attacker if they want to crit
        this.turnPlayer.options = {
            uiType: 'binaryoption',
            binaryoption: {
                prompt: `Would you like to perform a critical hit? Attacker: ${this.turnPlayer.getSelectedUnit().getName()}`
                        + ` (${this.turnPlayer.getSelectedUnit().getAttack()}), Defender: ${defendingPlayer.getSelectedUnit().getName()}`
                        + ` (${defendingPlayer.getSelectedUnit().getAttack()})`
            }
        };

        this.turnPlayer.optionResults = [
            {func: "crit"},
            {func: "crit"}
        ];

        this.sendGameState();
    }

    askEvade() {
        let defendingPlayer = this.getOtherPlayer(this.turnPlayer.name);

        // ask the defender if they want to evade
        defendingPlayer.options = {
            uiType: 'binaryoption',
            binaryoption: {
                prompt: `Would you like to perform an evade? Attacker: ${this.turnPlayer.getSelectedUnit().getName()}`
                    + ` (${this.turnPlayer.getSelectedUnit().getAttack()}), Defender: ${defendingPlayer.getSelectedUnit().getName()}`
                    + ` (${defendingPlayer.getSelectedUnit().getAttack()})`
            }
        };

        defendingPlayer.optionResults = [
            {func: "evade"},
            {func: "evade"}
        ];

        this.sendGameState();
    }

    mathAttackResult(evade=false) {
        let defendingPlayer = this.getOtherPlayer(this.turnPlayer.name);
        let attackingUnit = this.turnPlayer.getSelectedUnit();
        let defendingUnit = defendingPlayer.getSelectedUnit();

        // calculate the result of the attack
        if (!evade) {
            let attackerWins = attackingUnit.getAttack() >= defendingUnit.getAttack();
            if (attackerWins) {
                // destroy a unit if
                defendingPlayer.destroySelectedUnit();
            }
        }

        // clean up the attack
        defendingPlayer.discardSupport();
        this.turnPlayer.discardSupport();

        delete attackingUnit.modifiers.attack;
        delete defendingUnit.modifiers.attack;

        // check for an empty front line
        this.getOtherPlayer(this.turnPlayer.name).checkForForcedMarch();

        // prompt the turn player to continue their action phase
        this.turnPlayer.actionUnitSelect();
    }

    lose(losingPlayer) {
        let winningPlayer = this.getOtherPlayer(losingPlayer.name);
        winningPlayer;
        // TODO
    }

}
exports.Room = Room;
