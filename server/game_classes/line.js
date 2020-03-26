class Line {

    constructor(){
        this.model = [];
    }

    length() {
        return this.model.length;
    }

    deploy(unit) {
        this.model.push(unit);
    }

    getUnit(index) {
        return this.model[index];
    }

    tap(index) {
        this.model[index].tap();
    }

    remove(index) {
        let temp = this.model[index];
        this.model.splice(index, 1);
        return temp;
    }

    add(unit) {
        this.model.push(unit);
    }

    getClientVersion() {
        let ret = [];

        for (let i = 0; i < this.model.length; i++) {
            ret.push(this.model[i].getClientVersion())
        }

        return ret;
    }

    contains(name) {
        let ret = false;

        this.model.forEach((unit) => {
            if (unit.cards[0].get().name === name) {
                ret = true;
            }
        });

        return ret;
    }

    levelup(newCard) {
        let oldUnit = null;

        this.model.forEach((unit) => {
            if (unit.cards[0].get().name === newCard.get().name) {
                oldUnit = unit;
            }
        });

        oldUnit.levelup(newCard);
    }


    untapAll() {
        this.model.forEach(function (unit) {
            unit.untap();
        });
    }

    removeAllModifiers(mod) {
        this.model.forEach((unit) => {
            unit.removeMod(mod);
        });
    }
}

exports.Line = Line;