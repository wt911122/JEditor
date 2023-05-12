import { INSTANCE_TYPE } from '../constants';
import Base, { _insert, _findIndex, _getChild, _getLastChild, _splice, _forEach } from "./base";
import { createDocumentElement } from '../components/ctors';

class EditArea extends Base {
    static create(editor) {
        console.log(INSTANCE_TYPE.EDIT_AREA)
        const elem = createDocumentElement(INSTANCE_TYPE.EDIT_AREA);
        const instance = new EditArea();
        instance._editor = editor;
        instance.attach(elem);
        return instance;
    }

    static TYPE = INSTANCE_TYPE.EDIT_AREA;

    _lines = []

    insert(line, idx) {
        _insert(
            this.documentElement,
            this._lines,
            idx, line);
    }

    getChildren() {
        return this._lines;
    }
    findIndex(child) {
        return _findIndex(this._lines, child);
    }
    getChild(idx) {
        return _getChild(this._lines, idx);
    }
    getLastChild() {
        return _getLastChild(this._lines);
    }
    getFirstChild() {
        return this._lines[0];
    }
    getLength() {
        return this._lines.length;
    }
    splice(start, deleteCount, ...items){
        return _splice(
            this._lines, 
            this.documentElement,
            start, deleteCount, ...items);
    }

    blur() {
        this.documentElement.classList.remove('active');
    }

    focus() {
        this.documentElement.classList.add('active');
    }

    forEach(callback, start = 0, end) {
        _forEach(this._lines, callback, start, end);
    }

    serialize() {
        return {
            type: INSTANCE_TYPE.EDIT_AREA,
            lines: this._lines.map(el => el.serialize())
        }
    }
}

export default EditArea;