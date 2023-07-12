import { makeElement } from '../../src/core/components/dom';

function template() {
    return {
        parser(callback) {
            const test = callback((codes) => codes.find(c => c.meta.addtional?.key === 'test'));
            const nasl = {
                concept: 'WhileStatement',
                test: test?.[0],
                body: callback((codes) => codes.find(c => c.meta.addtional?.key === 'body')),
            }
            return nasl
        },
    }
}


function component() {
    // let slots = [];
    const testContainer = makeElement({
        tag: 'div',
        className: ['nasl-func-args-wrapper'],
    });
    const bodyContainer = makeElement({
        tag: 'div',
        className: ['nasl-func-args-wrapper', 'nasl-block'],
    })
    const initialize = () => {
        return makeElement({
            tag: 'div',
            className: ['nasl-while'],
            childNodes: [
                makeElement({
                    tag: 'div',
                    className: ['nasl-if-test'],
                    childNodes: [ 
                        makeElement({
                            tag: 'span',
                            textContent: 'WHILE (',
                        }),
                        testContainer,
                        makeElement({
                            tag: 'span',
                            textContent: ')',
                        }),
                    ]
                }),
                bodyContainer,
            ]
        });
    }

    const insertEditArea = (edirarea, idx, meta) => {
        if(meta.addtional?.key === 'test') {
            const el = edirarea.documentElement;
            testContainer.append(el);
        }
        if(meta.addtional?.key === 'body') {
            const el = edirarea.documentElement;
            bodyContainer.append(el);
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