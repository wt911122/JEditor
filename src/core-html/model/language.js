
class Language {
    constructor(lang) {
        this.lang = lang;
    }
    resolve(source) {
        if(this.lang) {
            return this.lang.resolveToElements(source);
        }
        return []
    }

    tokenize(source) {
        if(this.lang) {
            return this.lang.tokenize(source);
        }
        return []
    }

    requestSuggestions(content, nextOffset) {
        if(this.lang && this.lang.requestSuggestions) {
            return this.lang.requestSuggestions(content, nextOffset);
        }
        return Promise.reject();
    }

    parse() {
        if(this.lang && this.lang.parse) {
            return this.lang.parse(...arguments);
        }
        return [];
    }
}

export default Language

export function astWalker(ast, parent, key, callback) {
    callback(ast, parent, key);
    Object.keys(ast).forEach(key => {
        const obj = ast[key];
        if(callback(obj, ast, key)){
            astWalker(obj, ast, key, callback);
        }
    })
}