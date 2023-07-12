import { makeElement } from '../../src/core/components/dom';

function template(source) {
    return {
        parser(callback) {
            const test = callback((codes) => codes.find(c => c.meta.addtional?.key === 'test'));
            const nasl = {
                concept: 'IfStatement',
                test: test?.[0],
                consequent: callback((codes) => codes.find(c => c.meta.addtional?.key === 'consequent')),
                alternate: callback((codes) => codes.find(c => c.meta.addtional?.key === 'alternate')),
            }
            return nasl
        },
    }
}


function component(source) {
    // let slots = [];
    const testContainer = makeElement({
        tag: 'div',
        className: ['nasl-func-args-wrapper'],
    });
    const consequentContainer = makeElement({
        tag: 'div',
        className: ['nasl-func-args-wrapper', 'nasl-block'],
    })
    const alternateContainer = makeElement({
        tag: 'div',
        className: ['nasl-func-args-wrapper', 'nasl-block'],
    })
    const initialize = () => {
        return makeElement({
            tag: 'div',
            className: ['nasl-ifstatement'],
            childNodes: [
                makeElement({
                    tag: 'div',
                    className: ['nasl-if-test'],
                    childNodes: [ 
                        makeElement({
                            tag: 'span',
                            textContent: 'IF (',
                        }),
                        testContainer,
                        makeElement({
                            tag: 'span',
                            textContent: ')',
                        }),
                    ]
                }),
                consequentContainer,
                makeElement({
                    tag: 'span',
                    textContent: 'ELSE',
                }),
                alternateContainer,
            ]
        });
    }

    const insertEditArea = (edirarea, idx, meta) => {
        if(meta.addtional?.key === 'test') {
            const el = edirarea.documentElement;
            testContainer.append(el);
        }
        if(meta.addtional?.key === 'consequent') {
            const el = edirarea.documentElement;
            consequentContainer.append(el);
        }
        if(meta.addtional?.key === 'alternate') {
            const el = edirarea.documentElement;
            alternateContainer.append(el);
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