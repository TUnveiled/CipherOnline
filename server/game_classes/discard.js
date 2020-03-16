class Discard {
    constructor() {
        this.model = [];
    }

    get() {
        return this.model;
    }

    pop() {
        return this.grab(0);
    }

    grab(index) {
        let temp = this.model[index];
        this.model.splice(index, 1);
        return temp;
    }

    push(element) {
        this.model.push(element);
    }

    length() {
        return this.model.length;
    }

    getClientVersion() {
        return {
            count: this.length(),
            imageref: (this.length()) ? this.model[this.length() - 1].get().imageref : ""
        }
    }
}

exports.Discard = Discard;