import LanguageContext from '../src/core/language/language-context';
import { makeElement } from '../src/core/components/dom';
import { TOKEN, INSTANCE_TYPE } from '../src/core/constants';
import { make } from './model';

export const CallFunctionRender = (source) => {
    const editareaWrapper = (idx, editAreaDocumentElement) => {
        const target = source.arguments[idx];
        console.log(target)
        return makeElement({
            tag: 'div',
            className: ['nasl-func-args'],
            childNodes: [
                makeElement({
                    tag: 'span',
                    className: ['nasl-func-arguname'],
                    textContent: target.name,
                }),
                makeElement({
                    tag: 'span',
                    className: ['nasl-colon'],
                    textContent: ":",
                }),
                editAreaDocumentElement,
            ]
        })
    }
    const compositeContainer = makeElement({
        tag: 'span',
        className: ['nasl-func-args-wrapper'],
    })
    const rootElement = makeElement({
        tag: 'div',
        className: ['nasl-callfunction'],
        childNodes: [
            makeElement({
                tag: 'span',
                className: ['nasl-func-name'],
                textContent: source.name,
            }),
            makeElement({
                tag: 'span',
                className: ['nasl-func-brackets'],
                textContent: '(',
            }),
            compositeContainer,       
            makeElement({
                tag: 'span',
                className: ['nasl-func-brackets'],
                textContent: ')',
            }),
        ]
    })
    return {
        rootElement,
        compositeContainer,
        editareaWrapper,
    }

}

const RE_TOKEN = /[0-9]+(\.[0-9]*)?([eE][\+\-]?[0-9]+)?|[A-Za-z_][A-Za-z_0-9]*|[+-/*]|\S|\s+/g;
function resolver(text) {
    if (/^[A-Za-z_]/.test(text)) {
        return TOKEN.IDENTIFIER;
    } else if (/^[0-9]/.test(text)) {
        return TOKEN.NUMBER;
    } else if(/^[+-/*]/.test(text)){
        return TOKEN.OPERATOR;
    }
    return TOKEN.TEXT;
}


function translateCompletion(completion) {
    const context = new LanguageContext();
    completion.traverse(context);
    context._contextRoot = context._currentTarget.elements[0];
    return context;
}
export function translateRoot(astroot) {
    const context = new LanguageContext();
    astroot.traverse(context);
    context.restore();
    return context;
}

export const NaslLanguage = {
    components: {
        CallFunction: CallFunctionRender,
    },

    parse(content) {

    },

    tokenize(source) {
        const tokens = [];
        for(;;) {
            const match = RE_TOKEN.exec(source);
            if (match === null) {
                break;
            }
            const token = {
                kind: resolver(match[0]),
                index: match.index,
                content: match[0],
            }// new Token(match[0], match.index);
            tokens.push(token);
        }
        return tokens;
    },

    staticAutoCompletions: {
        "tan": {
            prefix: 'tan',
            body: translateCompletion(make({
                concept: 'CallFunction',
                name: 'tan',
                arguments: [
                    {
                        concept: 'Argument',
                        name: 'angle',
                        expression: {
                            concept: 'NumberLiteral',
                            value: '',
                        }
                    }
                ]
            })),
        },
        "tangle": {
            prefix: 'tangle',
            body: translateCompletion(make({
                concept: 'CallFunction',
                name: 'tangle',
                arguments: [
                    {
                        concept: 'Argument',
                        name: 'param',
                        expression: {
                            concept: 'NumberLiteral',
                            value: '',
                        }
                    }
                ]
            })),
        }
    }

}


