import { INSTANCE_TYPE } from '../constants';
import Composite from '../instance/composite';
import EditArea from '../instance/edit-area';
import EditLine from '../instance/edit-line';
import TextElement from '../instance/text-element';

class LanguageContext {
    _stack = [];
    _currentTarget = null;

    constructor() {
        const editArea = this.createEditAreaMeta();
        this._stack.push(editArea);
        this._currentTarget = editArea;
    }

    addElement(element) {
        const target = this._currentTarget;
        switch(target.type){
            case INSTANCE_TYPE.COMPOSITE:
                target.editareas.push(element);
            break;
            case INSTANCE_TYPE.EDIT_AREA:
                target.elements.push(element);
            break;
            case INSTANCE_TYPE.TEXT_ELEMENT:
                console.error('无法添加元素')
            break;
        }
    }

    getCurrent() {
        const target = this._currentTarget;
        switch(target.type){
            case INSTANCE_TYPE.COMPOSITE:
                return target.editareas[target.editareas.length-1]
            case INSTANCE_TYPE.EDIT_AREA:
                return target.elements[target.elements.length-1]
            case INSTANCE_TYPE.TEXT_ELEMENT:
                console.error('无法获取元素')
            break;
        }
        return null;
    }

    save() {
        const target = this.getCurrent();
        this._stack.push(this._currentTarget);
        this._currentTarget = target;
    }

    restore() {
        if(this._currentTarget.type === INSTANCE_TYPE.EDIT_AREA) {
            const elems = this._currentTarget.elements;
            let l = elems.length;
            if(l === 0) {
                elems.push(this.createTextElementMeta())
            } else {
                if(elems[0].type !== INSTANCE_TYPE.TEXT_ELEMENT) {
                    elems.unshift(this.createTextElementMeta())
                }
                l = elems.length;
                if(elems[l-1].type !== INSTANCE_TYPE.TEXT_ELEMENT) {
                    elems.push(this.createTextElementMeta())
                }
                l = elems.length;
                let i = 1;
                const elements = [elems[0]];
                while (i < l) {
                    const cur = elems[i];
                    const lastElem = elements[elements.length-1];
                    if(lastElem.type === INSTANCE_TYPE.TEXT_ELEMENT && cur.type === INSTANCE_TYPE.TEXT_ELEMENT) {
                        lastElem.content += cur.content;
                    } else {
                        elements.push(cur);
                    }
                    i++;
                }
                this._currentTarget.elements = elements;
            }

        }
        this._currentTarget = this._stack.pop();
    }

    createTextElementMeta(content = '') {
        return {
            type: INSTANCE_TYPE.TEXT_ELEMENT,
            content,
        }
    }
    createEditAreaMeta() {
        return {
            type: INSTANCE_TYPE.EDIT_AREA,
            elements: []
        }
    }
    createCompositeMeta(node, sourceType) {
        return {
            type: INSTANCE_TYPE.COMPOSITE,
            editareas: [],
            source: node,
            sourceType,
        }
    }
}

export default LanguageContext

export function loopMeta(root, parent, callback) {
    callback(root, parent);
    let list;
    switch(root.type){
        case INSTANCE_TYPE.COMPOSITE:
            list = root.editareas;
            break;
        case INSTANCE_TYPE.EDIT_AREA:
            list = root.elements;
            break
        default:
            list = [];
    }
    list.forEach(meta => {
        loopMeta(meta, root, callback);
    });
}
// function getChildren(node) {
//     let list;
//     switch(node.type){
//         case INSTANCE_TYPE.COMPOSITE:
//             list = node.editareas;
//             break;
//         case INSTANCE_TYPE.EDIT_AREA:
//             list = node.elements;
//             break
//         default:
//             list = [];
//     }
//     return list;
// }

// export function DepthFirstLoopMeta(root, callback) {
//     let queue = [root]
//     while (queue.length !== 0) {
//         const node = queue.shift();
//         callback(node);
//         queue = queue.concat(getChildren(node));
//     }
// }

// export function breadthFirstLoopMeta(root, callback) {
//     let queue = [root]
//     while (queue.length !== 0) {
//         const node = queue.shift();
//         callback(node);
//         queue = queue.concat(getChildren(node));
//     }
// }

function createInstance(meta, editor) {
    switch(meta.type) {
        case INSTANCE_TYPE.COMPOSITE:
            const component = editor.lang.components[meta.sourceType];
            if(component) {
                const {
                    rootElement,
                    compositeContainer,
                    editareaWrapper,
                } = component(meta.source);
                const instance = Composite.create(editor);
                instance.documentElement.append(rootElement);
                instance.setCompositeContainer(compositeContainer);
                instance.setEditAreaWrapper(editareaWrapper)
                return instance;
            }
            return Composite.create(editor);
        case INSTANCE_TYPE.EDIT_AREA:
            return EditArea.create(editor);
        case INSTANCE_TYPE.LINE:
            return EditLine.create(editor);
        case INSTANCE_TYPE.TEXT_ELEMENT:
            return TextElement.create(editor, meta.content);
    }
}

export function resolveContextMeta(context, editor) {
    const rootMeta = context._currentTarget;
    const map = new WeakMap();
    loopMeta(rootMeta, null, (meta, parent) => {
        const instance = createInstance(meta, editor);
        if(meta.type === INSTANCE_TYPE.EDIT_AREA) {
            instance.insert(EditLine.create());
        }
        map.set(meta, instance);
        if(!parent) {
            return;
        }
        let parentInstance = map.get(parent);
        if(parent.type === INSTANCE_TYPE.EDIT_AREA) {
            parentInstance = parentInstance._lines[0];
        }
        parentInstance.insert(instance);
    });
    return map.get(rootMeta);
}