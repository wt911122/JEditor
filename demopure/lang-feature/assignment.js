import { makeElement } from '../../src/core/components/dom';

function template(source) {
    return {
        parser(callback) {
            const left = callback((codes) => codes.find(c => c.meta.addtional?.key === 'left'));
            const right = callback((codes) => codes.find(c => c.meta.addtional?.key === 'right'));
            const nasl = {
                concept: 'Assignment',
                left: left?.[0],
                right: right?.[0],
            }
            return nasl
        },
    }
}


function component(source) {
    // let slots = [];
    const leftContainer = makeElement({
        tag: 'div',
        className: ['nasl-func-args-wrapper'],
    });
    const rightContainer = makeElement({
        tag: 'div',
        className: ['nasl-func-args-wrapper'],
    })
    const initialize = () => {
        return makeElement({
            tag: 'div',
            className: ['nasl-assignment'],
            childNodes: [
                makeElement({
                    tag: 'span',
                    textContent: '将',
                }),
                leftContainer,
                makeElement({
                    tag: 'span',
                    textContent: '赋值为',
                }),
                rightContainer,
            ]
        });
    }

    const insertEditArea = (edirarea, idx, meta) => {
        if(meta.addtional?.key === 'left') {
            const el = edirarea.documentElement;
            leftContainer.append(el);
        }
        if(meta.addtional?.key === 'right') {
            const el = edirarea.documentElement;
            rightContainer.append(el);
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