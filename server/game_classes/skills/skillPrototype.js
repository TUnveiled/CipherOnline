
exports.Skill = class {

    constructor() {
        this.type = "";
        this.desc = "";
        this.name = "";
    }

    async effect() {

    }

    getText() {
        return `${this.name} [${this.type}] :${this.desc}`;
    }

};