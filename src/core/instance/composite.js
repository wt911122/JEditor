import { INSTANCE_TYPE, JEDITOR_EVENTS } from '../constants';
import Base, { _insert, _findIndex, _getChild, _getLastChild } from "./base";
import { createDocumentElement } from '../components/ctors';
import { Structure } from '../language/language-particle';
// import {
//     queryChildren
// } from '../utils';

class Composite extends Base {
    static create(editor, sourceType) {
        const elem = createDocumentElement(INSTANCE_TYPE.COMPOSITE);
        const instance = new Composite();
        instance._editor = editor;
        instance.sourceType = sourceType;
        instance.attach(elem);
        this._compositeContainer = this.documentElement;
        return instance;
    }
    static TYPE = INSTANCE_TYPE.COMPOSITE;
    sourceType = undefined;


    _editareas = []
    _compositeContainer = null;
    _editAreaWrapper = null;

    _parser = null;

    getEditArea(idx) {
        return this._editareas[idx];
    }

    setCompositeContainer(container) {
        this._compositeContainer = container;
    }

    setEditAreaWrapper(wrapper) {
        this._editAreaWrapper = wrapper;
    }

    setParser(parser) {
        this._parser = parser
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

    prepareParse(idx) {
        const structure = new Structure(idx, this._parser);
        this._editareas.forEach(erea => {
            const freeCode = erea.prepareParse();
            structure.appendFreeCode(freeCode)
        });
        return structure;
    }
}

export default Composite;