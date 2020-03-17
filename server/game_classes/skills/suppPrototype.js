const Skill = require("./skillPrototype").Skill;

function SUPP(name, desc, suppType) {
    this.type = "SUPP";
    this.desc = desc;
    this.name = name;
    this.suppType = suppType;
}

SUPP.prototype = new Skill();

SUPP.prototype.getText = function() {
    return `${this.name} [${this.suppType} ${this.type}] : ${this.desc}`;
};

SUPP.prototype.constructor = SUPP;

exports.SUPP = SUPP;