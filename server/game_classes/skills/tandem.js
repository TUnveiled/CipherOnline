const SUPP = require("./suppPrototype").SUPP;

let skillObj = new SUPP("Tandem Emblem", "Until the end of this combat, your Brown attacking unit gains +10 attack.", "ATK");

skillObj.condition = function(player) {
    return player.room.turnPlayer === player &&
        player.getSelectedUnit().hasSymbol("Brown");
};

skillObj.effect = async function(player) {
    if (this.condition(player))
        player.getSelectedUnit().modifiers['attack'] += 10;
};

exports.skillObj = skillObj;