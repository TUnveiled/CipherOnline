const SUPP = require("./suppPrototype").SUPP;

let skillObj = new SUPP("Hero Emblem", "Until the end of this combat, the number of Orbs that your Brown attacking" +
    " unit's attack will destroy becomes 2.", "ATK");

skillObj.condition = function(player) {
    return player.room.turnPlayer === player && player.getSelectedUnit().hasSymbol('Brown');
};

skillObj.effect = async function(player) {
    if (this.condition(player))
        player.room.effects.push({
            endCondition: "endOfCombat",
            type: "doubleOrb"
        });
};

exports.skillObj = skillObj;