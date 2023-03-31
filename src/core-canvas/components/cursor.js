class Cursor {
    constructor() {
        this.element = [];
        this.offset = 0;
    }

    set(configs) {
        Object.assign(this, configs);
    }

    move(length) {
        this.offset += length;
    }

    setOffset(offset) {
        this.offset = offset;
    }

    moveToNextElemet() {
        const lastIndex = this.element.length - 1;
        this.element[lastIndex]++;
        this.offset = 0;
    }
}

export default Cursor;