class Hand {
    constructor() {
        this.model = []
    }

    push(element) {
        this.model.push(element);
    }

    getClientVersion() {
        let temp = [];

        for (let i = 0; i < this.model.length; i++) {
            temp.push(this.model[i].get().id);
        }

        return temp;
    }

    grab(index) {
        let temp = this.model[index];
        this.model.splice(index, 1);
        return temp;
    }

    pop() {
        return this.grab(0);
    }

    length() {
        return this.model.length;
    }
}

exports.Hand = Hand;