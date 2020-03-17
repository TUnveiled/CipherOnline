const SUPP = require("./suppPrototype").SUPP;

let skillObj = new SUPP("Magic Emblem", "Draw 1 card. Choose 1 card in your hand, and send it to the Retreat Area.", "ATK");

skillObj.condition = function(player) {
    return player.room.turnPlayer === player;
};

skillObj.effect = async function(player) {
    if (this.condition(player)) {
        player.draw(1);

        await player.discard(1, "Discard a card for mage emblem");
    }
};

exports.skillObj = skillObj;