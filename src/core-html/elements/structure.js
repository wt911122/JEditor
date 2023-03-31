import { createStructureElem } from '../components/index';
import { JEDITOR_MODEL_REF } from '../constants';
import { setCaret, STRUCTURE_SYMBOL } from '../utils/index';
import { JEditorElement } from './element';
import { astWalker } from '../model/language';
import Base from './base';

export class JEditorStructure extends Base {
    domElement = null;
    constructor() {
        super();
        this.elements = [];
        this.domElement = createStructureElem();
        this.domElement[JEDITOR_MODEL_REF] = this;
    }

    render(wrapper) {
        const elm = this.domElement;
        wrapper.append(elm);
        this.elements.forEach(el => {
            el.render(elm);
        });
    }

    _getParentNode() {
        let parentNode = this.parent;
        if(parentNode === 'root') {
            parentNode = this.__context__.editor;
        }
        return parentNode;
    }

    updateBy(idx, deleteNum, elements) {
        elements.forEach(el => {
            el.parent = this;
        })
        this.elements.splice(idx, deleteNum, ...elements);
        const children = Array.from(this.domElement.children);
        const elm = this.domElement;
        
        children.splice(idx, deleteNum, ...elements.map(el => {
            el.render(elm);
            el.update();
            return el.domElement;
        }));
        this.domElement.replaceChildren(...children);
    }

    update() {
        this.elements.forEach(el => {
            el.update();
        });
    }

    /* parse(ast) {
        const lang = this.__context__.getLang();
        const elem = [];
        this.elements.forEach(el => {
            if(el instanceof JEditorStructure) {
                elem.push(STRUCTURE_SYMBOL);
                el.parse(ast);
            } else {
                elem.push(el);
            }
        });
        lang.parse(elem)
    }*/
    parse() {
        return () => {};
    }

    parseToStructure(parent, key) {
        let expr = '';
        let i = 0;
        let map = {};
        this.elements.forEach((el) => {
            if(el instanceof JEditorStructure) {
                const key = `$${i}`;
                expr += key;
                i++;
                map[key] = el;
            } else {
                expr += el.source;
            }
        })
        const result = this.getLang().parse(expr);
        astWalker(result, parent, key, (obj, currparent, currkey) => {
            if(obj.type === "Identifier") {
                const struct = map[obj.name];
                if(struct) {
                    currparent[currkey] = struct._parse(currparent, currkey);
                }
            } else if(typeof obj === 'object') {
                return true;
            }
        });
        return result;
    }

    _parse(parent, key) {
        return this.parse(() => {
            this.parseToStructure(parent, key);
        })
    }

    destroy() {
        this.domElement.remove();
    }

    focus() {
        const elem = this.elements[0];
        if(elem instanceof JEditorElement) {
            return elem.head();
        } else {
            return elem.focus();
        }
    }

    traverseFirstOrder(callback, condition) {
        const l = this.elements.length;
        for(let i = 0; i < l; i++) {
            const elem = this.elements[i];
            if(condition && condition(elem)) {
                const result = callback(elem);
                if(!result) {
                    return;
                }
            } else {
                callback(elem)
            }
            if(elem instanceof JEditorStructure) {
                elem.traverseFirstOrder(callback)
            }
        }
    }
}