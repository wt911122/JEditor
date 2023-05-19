import { CallFunction, Argument } from "../model";
import { makeElement } from '../../src/core/components/dom';
// import { Structure } from "../../src/core/language/structuring";

export function render(source) {
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

function template(source) {
    const name = source.name;
    const _arguments = source.arguments.map(argu => argu.name);
    
    return {
        parser(callback) {
            const nasl = {
                concept: 'CallFunction',
                name,
                arguments: []
            }
            _arguments.forEach((argu, idx) => {
                nasl.arguments.push({
                    concept: 'Argument',
                    name: argu,
                    expression: callback(idx)
                })
            });
            return nasl
        },
    }
}

export default {
    render,
    template
}