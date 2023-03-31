import { createElementElem } from '../components/index';
import { JEDITOR_MODEL_REF } from '../constants';
import { setCaret, renderToken } from '../utils/index';
import Base from './base';

export class JEditorElement extends Base{
    domElement = null;
    constructor(s) {
        super();
        this.source = s || '';
        this.domElement = createElementElem();
        this.domElement[JEDITOR_MODEL_REF] = this;
        this._dirty = true;
    }

    appendSource(s) {
        this.source += s;
        this._dirty = true;
    }

    updateSource(s) {
        this.source = s;
        this._dirty = true;
    }

    render(wrapper) {
        if(!this.domElement.parentNode) {
            wrapper.append(this.domElement);
        }
    }

    update() {
        if(this._dirty) {
            const tokens = this.getLang().tokenize(this.source);
            const result = renderToken(tokens);
            this._tokens = tokens;
            this._tokenMap = result.tokenMap;
            this.domElement.innerHTML = '';
            if(result.template.length === 0) {
                this.domElement.append(new Text());
            } else {
                this.domElement.append(...result.template);
            }

            this._dirty = false
        }
    }

    destroy() {
        this.domElement.remove();
    }

    focus() {
        this.domElement.focus();
        return this;
    }

    body(offset) {
        const childNodes = this.domElement.childNodes;
        let elem = null;
        for (var i = 0; i < childNodes.length; i++) {
            elem = childNodes[i];
            const c_len = elem.textContent.length;
            if(offset - c_len > 0) {
                offset -= c_len;
            } else {
               break; 
            }
        }
        if(elem && elem.nodeType !== Node.TEXT_NODE) {
            elem = elem.firstChild;
        }
        if(elem) {
            setCaret(elem, offset);
        } else {
            setCaret(this.domElement, offset);
        }
    }

    head() {
        const treeWalker = document.createTreeWalker(this.domElement, Node.SHOW_TEXT);
        const node = treeWalker.firstChild();
        console.log(node)
        setCaret(node, 0);
        return this;
    }

    tail() {
        const treeWalker = document.createTreeWalker(this.domElement, Node.SHOW_TEXT);
        const node = treeWalker.lastChild();
        setCaret(node, node.textContent.length);
    }

    getTokenByOffset(offset) {
        const l = this._tokens.length;
        let i = 0;
        while(i<l && this._tokens[i].index < offset) {
            i++;
        }
        i--;
        return this._tokens[i];
    }
}