import { INSTANCE_TYPE } from '../constants';
import Base, { 
    _insert, 
    _findIndex,
    _getChild,
    _getLastChild,
    _splice,
    _forEach,
} from "./base";
import { createDocumentElement } from '../components/ctors';
import { getPathOfInstance } from '../utils';
import TextElement from './text-element';
import Composite from './composite';

class EditLine extends Base {
    static create(editor) {
        const elem = createDocumentElement(INSTANCE_TYPE.LINE);
        const instance = new EditLine();
        instance._editor = editor;
        instance.attach(elem);
        return instance;
    }

    static TYPE = INSTANCE_TYPE.LINE;

    _elements = [];

    push(element, meta) {
        _insert(
            this.documentElement,
            this._elements,
            undefined, element);
    }

    insert(element, idx) {
        _insert(
            this.documentElement,
            this._elements,
            idx, element);
    }

    getChildren() {
        return this._elements;
    }

    findIndex(child) {
        return _findIndex(this._elements, child);
    }

    getChild(idx) {
        return _getChild(this._elements, idx);
    }
    
    getLastChild() {
        return _getLastChild(this._elements);
    }

    getFirstChild() {
        return this._elements[0];
    }

    getLength() {
        return this._elements.length;
    }

    splice(batchAction, start, deleteCount, ...items){
        const removed = _splice(
            this._elements, 
            this.documentElement,
            start, deleteCount, ...items);

        if(batchAction) {
            batchAction.push({
                op: 'splice',
                args: [start, deleteCount, ...items],
                removed,
                instance: this,
            })
        }
        return removed;
    }

    slice(...args) {
        return this._elements.slice(...args);
    }

    forEach(callback, start = 0, end) {
        _forEach(this._elements, callback, start, end);
    }

    reAttachChildNode() {
        this.documentElement.innerHTML = '';
        this._elements.forEach(el => {
            this.documentElement.append(el.documentElement);
        })
    }

    serialize() {
        const factory = () => {
            const editline = EditLine.create(this._editor);
            this._elements.forEach(element => {
                const elementFac = element.serialize();
                const newElement = elementFac();
                editline.push(newElement)
            })
            return editline;
        }
        return factory
    }

    prepareParse(freeCode) {
        this._elements.forEach(el => {
            if(el instanceof TextElement) {
                freeCode.appendCode(el.source, getPathOfInstance(el))
            }
            if(el instanceof Composite) {
                freeCode.appendComposite(el, getPathOfInstance(el))
            }
        })
    }
}

export default EditLine;