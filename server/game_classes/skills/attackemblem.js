const SUPP = require("./suppPrototype").SUPP;

let skillObj = new SUPP("Attack Emblem", "Until the end of this combat, your attacking unit gains +20 attack.", "ATK");

skillObj.condition = function(player) {
    return player.room.turnPlayer === player;
};

skillObj.effect = async function(player) {
    if (this.condition(player))
        player.getSelectedUnit().modifiers['attack'] += 20;
};

exports.skillObj = skillObj;