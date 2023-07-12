import { makeElement } from '../../src/core/components/dom';

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
                const expression = callback((codes) => {
                    return codes[idx]
                });
                nasl.arguments.push({
                    concept: 'Argument',
                    name: argu,
                    expression: expression?.[0],
                })
            });
            return nasl
        },
    }
}

function component(source) {
    // let slots = [];
    const subContainer =  makeElement({
        tag: 'div',
        className: ['nasl-func-args-wrapper'],
    });
    const initialize = () => {
        return makeElement({
            tag: 'div',
            className: ['nasl-callfunction'],
            childNodes: [
                makeElement({
                    tag: 'h1',
                    textContent: '内置函数',
                    childNodes: [
                        makeElement({
                            tag: 'span',
                            className: ['nasl-callfunction-name'],
                            textContent: source.name,
                        }),
                    ]
                }),
                subContainer,
            ]
        });
    }

    const insertEditArea = (edirarea, idx, meta) => {
        const target = source.arguments[idx];
        const el = edirarea.documentElement;
        const elem = makeElement({
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
                    textContent: " = ",
                }),
                el,
            ]
        });
        const nextElem = subContainer.children[idx];
        if(!nextElem) {
            subContainer.append(elem);
        } else {
            subContainer.insertBefore(elem, nextElem);
        }
    }
    return {
        initialize,
        insertEditArea
    }
}

export default {
    component,
    template
}