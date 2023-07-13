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
        // this._compositeContainer = this.documentElement;
        return instance;
    }
    static TYPE = INSTANCE_TYPE.COMPOSITE;
    sourceType = undefined;

    _areaMetaWeakMap = new WeakMap();

    _editareas = []
    // _compositeContainer = null;
    _editAreaWrapper = null;

    /**
     * insert
     */
    _component = null;
    

    _parser = null;

    getEditArea(idx) {
        return this._editareas[idx];
    }

    // setCompositeContainer(container) {
    //     this._compositeContainer = container;
    // }

    // setEditAreaWrapper(wrapper) {
    //     this._editAreaWrapper = wrapper;
    // }

    setComponent(componentFactory) {
        this._componentFactory = componentFactory;
        this._component = componentFactory();
        const comp = this._component.initialize();
        this.documentElement.append(comp);
    }

    setParser(parser) {
        this._parser = parser
    }

    push(editarea, meta) {
        const l = this._editareas.length;
        this._editareas.splice(l, 0, editarea);
        this._component.insertEditArea(editarea, l, meta);
        this._areaMetaWeakMap.set(editarea, meta);
    }

    insert(editarea, idx, meta) {
        this._editareas.splice(idx, 0, editarea);
        this._component.insertEditArea(editarea, idx, meta)
        // _insert(
        //     this._compositeContainer,
        //     this._editareas,
        //     idx, editarea, this._editAreaWrapper);
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
        const factory = () => {
            const composite = Composite.create(this._editor, this.sourceType);
            composite.setComponent(this._componentFactory);
            composite.setParser(this._parser);
            const areaMetaWeakMap = this._areaMetaWeakMap;
            this._editareas.forEach(area => {
                const editareaFac = area.serialize();
                const editarea = editareaFac();
                const meta = areaMetaWeakMap.get(area);
                composite.push(editarea, meta)
            });
            return composite;
        }
        
        return factory
    }

    prepareParse(idx) {
        const structure = new Structure(idx, this._parser);
        const areaMetaWeakMap = this._areaMetaWeakMap;
        console.log(areaMetaWeakMap)
        this._editareas.forEach(area => {
            const freeCode = area.prepareParse();
            const meta = areaMetaWeakMap.get(area);
            structure.appendFreeCode(meta, freeCode)
        });
        return structure;
    }
}

export default Composite;