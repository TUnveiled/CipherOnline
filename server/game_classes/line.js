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
}

exports.Line = Line;