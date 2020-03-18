const SUPP = require("./suppPrototype").SUPP;

let skillObj = new SUPP("Command Emblem", "Choose 1 ally, other than the attacking unit. You may move that ally.", "ATK");

skillObj.condition = function(player) {
    return player.room.turnPlayer === player && (player.frontline.length() + player.backline.length()) > 1;
};

skillObj.effect = async function(player) {
    if (this.condition(player)) {
        player.options = {
            uiType: 'binaryoption',
            binaryoption: {
                prompt: "Would you like to move a unit with Command Emblem?"
            }
        };
        player.optionResults = [
            {func: "skill"},
            {func: "skill"}
        ];

        player.skillFunc = skillObj.effect2;

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

        player.room.sendGameState();

        await completed;
    }
};

skillObj.effect2 = async function(indices, player) {
    let skipEffect = indices[0];

    if (!skipEffect) {

        player.options = {
            uiType: 'unitselect',
            unitselect: {
                message: 'click an allied unit other than the attacking unit to move them with Command Emblem',
                alliedUnits: true,
                enemyUnits: false
            },
        };

        // options to select each unit in their lines plus one to end the phase
        let lineLengths = player.frontline.length() + player.backline.length();
        player.optionResults = [];
        for (let j = 0; j <= lineLengths; j++) {
            this.optionResults.push({
                func: "skill"
            });
        }

        player.skillFunc = skillObj.effect3;

        player.room.sendGameState();

    } else {
        player.promiseFlag = true;
        player.optionResults = [];
        player.options = {};
    }
};

skillObj.effect3 = async function(indices, player) {

    let index = indices[0];

    // determine what unit corresponds to the response
    let inFrontLine = (index < player.frontline.length());
    let lineIndex = (inFrontLine) ? index : index - player.frontline.length();

    if (index === player.storedIndex) {
        player.room.sendGameState();
        return;
    } else if (lineIndex >= player.backline.length()) {
        await skillObj.effect(player);
        return;
    }

    // move the unit
    if (inFrontLine) {
        player.backline.add(player.frontline.remove(lineIndex));
    } else {
        player.frontline.add(player.backline.remove(lineIndex));
    }

    player.promiseFlag = true;
    player.optionResults = [];
    player.options = {};
    player.skillFunc = () => {};
};

exports.skillObj = skillObj;