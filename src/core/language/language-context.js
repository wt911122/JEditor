import { INSTANCE_TYPE } from '../constants';
import Composite from '../instance/composite';
import EditArea from '../instance/edit-area';
import EditLine from '../instance/edit-line';
import TextElement from '../instance/text-element';

class LanguageContext {
    _stack = [];
    _currentTarget = null;

    _contextRoot = null;
    _rootType = undefined;

    constructor() {
        // const editArea = this.createEditAreaMeta();
        // const editline = this.createEditLineMeta();
        // editArea.lines.push(editline);
        // this._stack.push(editArea);
        // this._stack.push(editline);
        // this._currentTarget = editline;
        // this._contextRoot = editArea;
    }

    addElement(element) {
        const target = this._currentTarget;
        switch(target.type){
            case INSTANCE_TYPE.COMPOSITE:
                target.editareas.push(element);
            break;
            case INSTANCE_TYPE.EDIT_AREA:
                target.lines.push(element);
            break;
            case INSTANCE_TYPE.LINE:
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
                return target.editareas[target.editareas.length-1];
            case INSTANCE_TYPE.EDIT_AREA:
                return target.lines[target.lines.length-1];
            case INSTANCE_TYPE.LINE:
                return target.elements[target.elements.length-1];
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
        if(this._currentTarget.type === INSTANCE_TYPE.LINE) {
            const elems = this._currentTarget.elements;
            let l = elems.length;
            if(l === 0) {
                // 没有也要 push 一个
                elems.push(this.createTextElementMeta())
            } else {
                // 保证composite前有都有一个 TEXT ELEMENT
                if(elems[0].type !== INSTANCE_TYPE.TEXT_ELEMENT) {
                    elems.unshift(this.createTextElementMeta())
                }
                l = elems.length;
                if(elems[l-1].type !== INSTANCE_TYPE.TEXT_ELEMENT) {
                    elems.push(this.createTextElementMeta())
                }
                // 合并 textElement
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

    createEditLineMeta() {
        return {
            type: INSTANCE_TYPE.LINE,
            elements: []
        }
    }

    createTextElementMeta(content = '') {
        return {
            type: INSTANCE_TYPE.TEXT_ELEMENT,
            content,
        }
    }
    createEditAreaMeta(node, sourceType, addtional) {
        return {
            type: INSTANCE_TYPE.EDIT_AREA,
            lines: [],
            source: node,
            sourceType,
            addtional,
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

export function loopMeta(current, parent, callback) {
    callback(current, parent);
    let list;
    switch(current.type){
        case INSTANCE_TYPE.COMPOSITE:
            list = current.editareas;
            break;
        case INSTANCE_TYPE.EDIT_AREA:
            list = current.lines;
            break
        case INSTANCE_TYPE.LINE:
            list = current.elements;
            break
        default:
            list = [];
    }
    list.forEach(meta => {
        loopMeta(meta, current, callback);
    });
}
/*
import { FreeCode, Structure } from './language-particle';
class LanguageContext {
    _stack = [];
    _current = null;

    _contextRoot = null;
    _rootType = undefined;

    static createCodeRoot() {
        const context = new LanguageContext();
        const code = new FreeCode();
        context._stack.push(code);
        context._currentTarget = code;
        context._contextRoot = code;
    }
    static createStructureRoot() {
        const context = new LanguageContext();
        const struct = new Structure();
        context._stack.push(struct);
        context._currentTarget = struct;
        context._contextRoot = struct;
    }

    createFreeCode() {
        return new FreeCode();
    }
    createStructure(source) {
        return new Structure(source);
    }

    appendCode(code) {
        this._current.source += code;
    }

    setCurrentFreeCode(freecode) {
        this._current = freecode;
    }

    getCurrentFreeCode() {
        return this._current;
    }

    addElement(element) {

    }

    getCurrent() {

    }

    save() {

    }

    restore() {
       
    }

}*/
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

// function createInstance(meta, editor) {
//     switch(meta.type) {
//         case INSTANCE_TYPE.COMPOSITE:
//             const component = editor.lang.components.get(meta.sourceType);
//             const template = editor.lang.templates.get(meta.sourceType);
//             console.log(component, meta.sourceType)
//             if(component && template) {
//                 const {
//                     rootElement,
//                     compositeContainer,
//                     editareaWrapper,
//                 } = component(meta.source);
//                 const parser = template(meta.source).parser
//                 const instance = Composite.create(editor, meta.sourceType);
//                 instance.setParser(parser)
//                 instance.documentElement.append(rootElement);
//                 instance.setCompositeContainer(compositeContainer);
//                 instance.setEditAreaWrapper(editareaWrapper)
//                 return instance;
//             }
//             return Composite.create(editor);
//         case INSTANCE_TYPE.EDIT_AREA:
//             return EditArea.create(editor);
//         case INSTANCE_TYPE.LINE:
//             return EditLine.create(editor);
//         case INSTANCE_TYPE.TEXT_ELEMENT:
//             return TextElement.create(editor, meta.content);
//     }
// }

export function resolveContextMeta(context, editor) {
    const rootMeta = context._contextRoot;
    const map = new WeakMap();
    loopMeta(rootMeta, null, (meta, parent) => {
        let instance
        if(meta.type === INSTANCE_TYPE.COMPOSITE) {
            const component = editor.lang.components.get(meta.sourceType);
            const template = editor.lang.templates.get(meta.sourceType);
            const parser = template(meta.source).parser
            instance = Composite.create(editor, meta.sourceType);
            instance.setParser(parser);
            instance.setComponent(() => component(meta.source));
        } else {
            switch(meta.type) {
                case INSTANCE_TYPE.EDIT_AREA:
                    instance = EditArea.create(editor);
                    break;
                case INSTANCE_TYPE.LINE:
                    instance = EditLine.create(editor);
                    break;
                case INSTANCE_TYPE.TEXT_ELEMENT:
                    instance = TextElement.create(editor, meta.content);
                    break;
            }
            
        }
        map.set(meta, instance);
        if(!parent) {
            return;
        }
        const parentInstance = map.get(parent);
        if(instance instanceof EditArea) {
            parentInstance.push(instance, {
                type: meta.type,
                sourceType: meta.sourceType,
                addtional: meta.addtional,
            });
        } else {
            parentInstance.push(instance)
        }
    });
    return map.get(rootMeta);
}