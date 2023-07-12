import LanguageContext from '../src/core/language/language-context';
import { TOKEN, INSTANCE_TYPE } from '../src/core/constants';
import { make } from './model';
import parser from './nasl/parser';
import {
    CallFunction,
    Assignment,
    IfStatement,
    WhileStatement
} from './lang-feature/index';

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
    const editArea = context.createEditAreaMeta();
    const editline = context.createEditLineMeta();
    editArea.lines.push(editline);
    context._stack.push(editArea);
    context._stack.push(editline);
    context._currentTarget = editline;
    context._contextRoot = editArea;

    completion.traverse(context);
    context._contextRoot = editline.elements[0];
    return context;
}
export function translateRoot(astroot) {
    const context = new LanguageContext();
    const editArea = context.createEditAreaMeta();
    context._stack.push(editArea);
    context._currentTarget = editArea;
    context._contextRoot = editArea;
    astroot.traverse(context);
    context.restore();
    context.restore();
    return context;
}

export const NaslLanguage = {
    feature: {
        CallFunction,
        Assignment,
        IfStatement,
        WhileStatement
    },

    codeParser(source) {
        return parser.parse(source)
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
        },
        "funcC": {
            prefix: 'funcC',
            body: translateCompletion(make({
                concept: 'CallFunction',
                name: 'funcC',
                arguments: [
                    {
                        concept: 'Argument',
                        name: 'p1',
                        expression: {
                            concept: 'NumberLiteral',
                            value: '',
                        }
                    },
                    {
                        concept: 'Argument',
                        name: 'p2',
                        expression: {
                            concept: 'NumberLiteral',
                            value: '',
                        }
                    },
                    {
                        concept: 'Argument',
                        name: 'p3',
                        expression: {
                            concept: 'NumberLiteral',
                            value: '',
                        }
                    }
                ]
            }))
        },
        "if": {
            prefix: 'if',
            body: translateCompletion(make({
                concept: 'IfStatement',
                name: 'IfStatement',
                consequent: [],
                alternate: []
            })),
        },
        "assignment": {
            prefix: 'assignment',
            body: translateCompletion(make({
                concept: 'Assignment',
            })),
        },
        "while": {
            prefix: 'while',
            body: translateCompletion(make({
                concept: 'WhileStatement',
                name: 'WhileStatement',
                body: [],
            })),
        }
    }

}


