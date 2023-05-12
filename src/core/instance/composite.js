import { INSTANCE_TYPE, JEDITOR_EVENTS } from '../constants';
import Base, { _insert, _findIndex, _getChild, _getLastChild } from "./base";
import { createDocumentElement } from '../components/ctors';
// import {
//     queryChildren
// } from '../utils';

class Composite extends Base {
    static create(editor) {
        const elem = createDocumentElement(INSTANCE_TYPE.COMPOSITE);
        const instance = new Composite();
        instance._editor = editor;
        instance.attach(elem);
        this._compositeContainer = this.documentElement;
        return instance;
    }
    static TYPE = INSTANCE_TYPE.COMPOSITE;

    _editareas = []
    _compositeContainer = null;
    _editAreaWrapper = null;

    getEditArea(idx) {
        return this._editareas[idx];
    }

    setCompositeContainer(container) {
        this._compositeContainer = container;
    }

    setEditAreaWrapper(wrapper) {
        this._editAreaWrapper = wrapper;
    }

    insert(editarea, idx) {
        _insert(
            this._compositeContainer,
            this._editareas,
            idx, editarea, this._editAreaWrapper);
    }

    getChildren() {
        return this._editareas;
    }

    findIndex(child) {
        return _findIndex(this._editareas, child);
    }

    getChild(idx) {
        return _getChild(this._editareas, idx);
    }

    getLastChild() {
        return _getLastChild(this._editareas);
    }

    getFirstChild() {
        return this._editareas[0];
    }

    getLength() {
        return this._editareas.length;
    }

    blur() {
        this.documentElement.classList.remove('active');
    }

    focus() {
        this.documentElement.classList.add('active');
    }

    ensureDelete() {
        this.documentElement.classList.add('ensuredelete');
    }

    preventDelete() {
        this.documentElement.classList.remove('ensuredelete');
    }

    serialize() {
        return {
            type: INSTANCE_TYPE.COMPOSITE,
            instance: this,
        }
    }
}

export default Composite;