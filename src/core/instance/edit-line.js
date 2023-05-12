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

    splice(start, deleteCount, ...items){
        return _splice(
            this._elements, 
            this.documentElement,
            start, deleteCount, ...items);
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
        return {
            type: INSTANCE_TYPE.LINE,
            elemenst: this._elements.map(el => el.serialize())
        }
    }
}

export default EditLine;