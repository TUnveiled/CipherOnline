const SUPP = require("./suppPrototype").SUPP;

let skillObj = new SUPP("Miracle Emblem", "Until the end of this combat, your opponent's attacking unit cannot perform a Critical Hit.\n", "DEF");

skillObj.condition = function(player) {
    return player.room.turnPlayer !== player;
};

skillObj.effect = async function(player) {
    if (this.condition(player))
        player.room.effects.push({
            endCondition: "endOfCombat",
            type: "skipCrit"
        });
};

exports.skillObj = skillObj;