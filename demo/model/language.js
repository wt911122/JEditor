import { 
    JEditorElement,
    JEditorStructure,
    JEditorToken,
} from '../../src/core-html/index';
import { make } from './model';
import parser from './parser';

function parseHtml(source) {
    var div = document.createElement('div');
    div.innerHTML = source.trim();

    return div.firstChild;
}
function functionNameElem(name, slotFunc) {
    const fragment = new DocumentFragment();
    [
        parseHtml(`<span class="jEditor-func">${name}</span>`),
        parseHtml(`<span class="jEditor-brackets">(</span>`),
        slotFunc,
        parseHtml(`<span class="jEditor-brackets">)</span>`),
    ].forEach(elemOrFunc => {
        if(typeof elemOrFunc === 'function') {
            elemOrFunc(fragment);
        } else {
            fragment.append(elemOrFunc)
        }
    })
    return fragment;
}

class CallFunctionStructure extends JEditorStructure {
    constructor(node) {
        super();
        this.name = node.name;
    }

    render(wrapper) {
        const elm = this.domElement;
        wrapper.append(elm);
        elm.append(functionNameElem(this.name, (fragment) => {
            const l = this.elements.length - 1;
            this.elements.forEach((el, idx) => {
                el.render(fragment);
                if(idx !== l) {
                    fragment.append(parseHtml(`<span>, </span>`));
                }
            });
           
        }));
    }

    onDestroy() {
        return this.name;
    }

    _parse() {
        const t = make({
            concept: 'CallFunction',
            name: this.name,
            arguments: [],
        })
        let argus = [];
        this.elements.forEach((el) => {
            if(el instanceof JEditorStructure) {
                argus.push(el._parse())
            }
        });
        t.arguments = argus;

        return t;
    }

    /* parse(callback) {
        let argus = [];
        this.elements.forEach((el) => {
            if(el instanceof JEditorStructure) {
                argus.push(el.parse())
            }
        });
        return make({
            concept: 'CallFunction',
            name: this.name,
            arguments: callback()
        })
    }*/
}

class ArgumentStructrue extends JEditorStructure {
    constructor(node) {
        super();
        this.name = node.name;
    }

    render(wrapper) {
        const elm = this.domElement;
        wrapper.append(elm);
        elm.append(parseHtml(`<span class="jEditor-args">${this.name}: </span>`));

        this.elements.forEach(el => {
            el.render(elm);
        });
    }

    updateBy(idx, deleteNum, elements) {
        elements.forEach(el => {
            el.parent = this;
        })
        this.elements.splice(idx, deleteNum, ...elements);
        const children = Array.from(this.domElement.children);
        const n1 = children.slice(0, 1);
        const n2 = children.slice(1);
        const elm = this.domElement;
        const newElem = elements.map(el => {
            el.render(elm);
            el.update();
            return el.domElement;
        });
        n2.splice(idx, deleteNum, ...newElem);
        this.domElement.replaceChildren(...n1, ...n2);
        
    }

    // parse(callback) {
    //     const r = callback();
    //     return make({
    //         concept: 'Argument',
    //         name: this.name,
    //         expression: r,
    //     })
    // }
    _parse() {
        const t = make({
            concept: 'Argument',
            name: this.name,
            expression: null,
        })
        const result = this.parseToStructure(t, 'expression')
        if(!t.expression) {
            t.expression = result;
        }
        return t;
    }
    // _parse() {
    //     const t = make({
    //         concept: 'CallFunction',
    //         name: this.name,
    //         expression: null,
    //     })
    //     let argus = [];
    //     this.elements.forEach((el) => {
    //         if(el instanceof JEditorStructure) {
    //             argus.push(el._parse())
    //         }
    //     });
    //     t.arguments = argus;

    //     return t;
    // }
    
}

const STRUCTURE_MAP = {
    CallFunctionStructure,
    ArgumentStructrue,   
}

class Token extends JEditorToken {
    resolve(text) {
        if (/^[A-Za-z_]/.test(text)) {
            return 'identifier';
        } else if (/^[0-9]/.test(text)) {
            return 'number';
        } else if(/^[+-/*]/.test(text)){
            return 'operator';
        }
        return undefined;
    }
}

const RE_TOKEN = /[0-9]+(\.[0-9]*)?([eE][\+\-]?[0-9]+)?|[A-Za-z_][A-Za-z_0-9]*|[+-/*]|\S|\s+/g;

export const NASLlang = {
    name: 'NASL',
    resolveToElements(naslroot) {
        const topElements = [];
        const stack = [topElements];
        const structureStack = [null];
        let currElements = topElements;
        let element = null;
        let currStucture = 'root';
        function getElement() {
            if(!element) {
                element = new JEditorElement();
                element.parent = currStucture;
            }
            return element;
        }
        function enterStrucure(structureCtor, node) {
            if(element) {
                currElements.push(element);
                element = null;
            }
            const structure = new STRUCTURE_MAP[structureCtor](node);
            currElements.push(structure);
            structure.parent = currStucture;
            stack.push(structure.elements);
            structureStack.push(structure)
            currElements = structure.elements;
            currStucture = structure;
        }
        function leaveStructure() {
            if(element) {
                currElements.push(element);
                element = null;
            }
            stack.pop();
            structureStack.pop();
            currElements = stack[stack.length-1];
            currStucture = structureStack[structureStack.length-1] || 'root';
        }
        naslroot.traverse(
            (node) => {
                // enter 
                if(node.concept === 'CallFunction') {
                    enterStrucure('CallFunctionStructure', node)
                }

                if(node.concept === 'Argument') {
                    enterStrucure('ArgumentStructrue', node)
                }

                if(['BinaryExpression'].includes(node.concept)) {
                    getElement().appendSource('(');
                }
            },
            (node) => {
                // middle
                getElement().appendSource(node.toCode());
            },
            (node) => {
                // leave
                if(['CallFunction', 'Argument'].includes(node.concept)) {
                   leaveStructure();
                }

                if(['BinaryExpression'].includes(node.concept)) {
                    getElement().appendSource(')');
                }
            });
        leaveStructure();
        console.log(topElements);
        return topElements;
    },

    tokenize(source) {
        const tokenList = [];
        for(;;) {
            const match = RE_TOKEN.exec(source);
            if (match === null) {
                break;
            }
            const token = new Token(match[0], match.index);
            tokenList.push(token);
        }
        return tokenList;
    },

    parse(expr) {
        const result = parser.parse(expr);
        if(result?.body?.[0]) {
            return result.body[0].expression;
        }
        return null;
       // return naslParser(expr);
    },

    requestSuggestions(element, offset) {
        const token = element.getTokenByOffset(offset);
        return new Promise((resolve) => {
            if(token.kind === 'identifier') {
                const text = token.text;
                const items = suggestions.filter(s => s.value.startsWith(text));
                console.log(text)
                resolve(items)
            }
            resolve([]);
        })
    }
}

const suggestions = [{
    value: 'sin',
    handler() {
        const node = make({
            concept: 'CallFunction',
            name: 'sin',
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
        });
        return NASLlang.resolveToElements(node)[0];
    }
},{
    value: 'cos',
    handler() {
        const node = make({
            concept: 'CallFunction',
            name: 'cos',
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
        });
        return NASLlang.resolveToElements(node)[0];
    }
},{
    value: 'tan',
    handler() {
        const node = make({
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
        });
        return NASLlang.resolveToElements(node)[0];
    }
}, {
    value: 'pow',
    handler() {
        const node = make({
            concept: 'CallFunction',
            name: 'pow',
            arguments: [
                {
                    concept: 'Argument',
                    name: 'num',
                    expression: {
                        concept: 'NumberLiteral',
                        value: '',
                    }
                },
                {
                    concept: 'Argument',
                    name: 'exp',
                    expression: {
                        concept: 'NumberLiteral',
                        value: '',
                    }
                }
            ]
        });
        return NASLlang.resolveToElements(node)[0];
    }
}]