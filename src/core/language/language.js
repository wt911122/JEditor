/*
    language Interface 
    - components
        - [sourceType]: renderer (source) => { rootElement, compositeContainer, editareaWrapper }
    - highlight (text) => { kind, index, content }[]
    - staticAutoCompletions
        - [completionName]: {
            prefix: string,
            body: LanguageContext
        }
*/
import { resolveContextMeta } from './language-context';
import { TOKEN } from '../constants';

function matchPrefix(content, prefix) {
    return prefix.startsWith(content);
}

class Completion {
    title = null;
    put = null;
    test() { return false; };
}

class Language {
    components = new Map();
    tokenize = null;
    staticAutoCompletions = []
    _lastToken = null;
    constructor(lang) {
        const {
            components,
            tokenize,
            staticAutoCompletions
        } = lang;

        const keys = Object.keys(components);
        keys.forEach(k => {
            this.components.set(k, components[k]);
        });
        this.tokenize = tokenize;

        Object.keys(staticAutoCompletions).forEach(k => {
            const defination = staticAutoCompletions[k];
            const completion = new Completion();
            completion.title = k;
            completion.put = (editor) => resolveContextMeta(defination.body, editor);

            if(defination.prefix) {
                const p = defination.prefix;
                completion.test = (content) => matchPrefix(content, p);
            }
            this.staticAutoCompletions.push(completion);
        });
    }

    getAutoCompletions(token) {
        if(token && token.kind === TOKEN.IDENTIFIER) {
            this._lastToken = token;
            return this.staticAutoCompletions.filter(c => {
                return c.test(token.content);
            });
        }
        return [];
    }
}

export default Language;