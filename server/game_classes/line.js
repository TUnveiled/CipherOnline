class Line {

    constructor(){
        this.model = [];
    }

    deploy(unit) {
        this.model.push(unit);
    }

    getClientVersion() {
        let ret = [];

        for (let i = 0; i < this.model.length; i++) {
            ret.push(this.model[i].getClientVersion())
        }

        return ret;
    }

    untapAll() {
        this.model.forEach(function (unit) {
            unit.untap();
        });
    }
}

exports.Line = Line;