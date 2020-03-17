
class CardCopy {
    constructor(ref) {
        this.cardData = ref;
    }

    get() {
        return this.cardData;
    }

    getSuppSkill() {
        let ret = null;
        if (this.cardData.skills)
            this.cardData.skills.forEach((skill) => {
                if (skill.type === 'SUPP')
                    ret = skill;
            });

        return ret;
    }

    getClientVersionOfSupport() {
        return this.cardData.id;
    }
}

exports.CardCopy = CardCopy;