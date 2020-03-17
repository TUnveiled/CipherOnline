const SUPP = require("./suppPrototype").SUPP;

let skillObj = new SUPP("Bullseye Emblem", "Until the end of this combat, non-Main Character defending units cannot evade.", "ATK");

skillObj.condition = function(player) {
    return player.room.turnPlayer === player;
};

skillObj.effect = async function(player) {
    if (this.condition(player))
        player.room.effects.push({
            endCondition: "endOfCombat",
            effect: "skipEvade",
            hitsMC: false
        });
};

exports.skillObj = skillObj;