export class JEditorToken {
    constructor(text, index) {
        this.text = text;
        this.index = index;
        this.kind = this.resolve(text);  
    }

    resolve(str) {
        return undefined;
    }
}
