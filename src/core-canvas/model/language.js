import TextElement from "../elements/textElement";

class Language {
    constructor(lang) {
        this.lang = lang;
    }
    resolve(source) {
        if(this.lang) {
            return this.lang.resolve(source);
        }
        return [new TextElement()]
    }
}

export default Language