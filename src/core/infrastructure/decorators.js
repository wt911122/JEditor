import { JEDITOR_ERROR_RANGE } from '../constants'
import { makeElement } from "../components/dom";
import { calculateTextWidth, queryInstanceByPath } from '../utils';

export class ErrorDecorator {
    static create(editor) {
        const elem = makeElement({
            tag: JEDITOR_ERROR_RANGE,
            className: ['jeditor-error-decorator'],
        });
        const errorDecorator = new ErrorDecorator();
        errorDecorator._editor = editor;
        errorDecorator.attach(elem)
        return errorDecorator;
    }

    _decorators = [];

    attach(elem) {
        this.documentElement = elem;
    }

    clear() {
        // this.documentElement.innerHTML = '';
        this._decorators = [];
    }

    addDecorator(record) {
        this._decorators.push(record);
    }

    resolve() {
        const editor = this._editor;
        const { monospace, monospacedouble } = editor.getEditorContext();
        const origin = this.documentElement.getBoundingClientRect();
        const decorates = [];
        console.log(this._decorators)
        this._decorators.forEach(d => {
            if(d.type === "TEXT") {
                const { offset, path } = d;
                const [a, b] = offset;
                const instance = queryInstanceByPath(path, editor.editareaRoot);
                // const len = Math.min(instance.getLength(), b);
                const begin = calculateTextWidth(instance.source, 0, a, monospace, monospacedouble);
                const width = Math.max(calculateTextWidth(instance.source, a, b, monospace, monospacedouble), 5)
                const rect = instance.documentElement.getBoundingClientRect();
                const point = [rect.x - origin.x + begin, rect.y - origin.y];
                console.log(point);
                decorates.push({
                    // point,
                    // width,
                    style: `height: 1.25em;width: ${width}px; transform: translate(${point[0]}px, ${point[1]}px)`,
                })
            }
            if(d.type === "STRUCTURE") {
                const path = d.path;
                const instance = queryInstanceByPath(path, editor.editareaRoot);
                const rect = instance.documentElement.getBoundingClientRect();
                const point = [rect.x - origin.x, rect.bottom - origin.y];
                console.log(point);
                decorates.push({
                    // point,
                    // width: rect.width,
                    style: `height: 2px;width: ${rect.width}px; transform: translate(${point[0]}px, ${point[1]}px)`,
                })
            }
        })
        this.render(decorates)
        // console.log(this._decorators);
    }

    render(decorates) {
        const elem = this.documentElement;
        decorates.forEach((meta, idx) => {
            const { point, width, style } = meta;
            let node = elem.childNodes[idx];
            if(!node) {
                node = makeElement({
                    tag: 'div',
                    className: ['je-er-dec']
                })

                elem.append(node);
            }
            node.style = style;
        });
        if(elem.childNodes.length > decorates.length) {
            const elements = Array.prototype.slice.call(elem.childNodes, decorates.length);
            elements.forEach(el => { el.remove() });
        }
    }



}
