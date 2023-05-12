import { INSTANCE_TYPE, JEDITOR_EVENTS } from '../constants';
import Base from "./base";
import { createDocumentElement } from '../components/ctors';
import { getEditor, tokenToHTML, calculateTextOffset } from '../utils';

class TextElement extends Base {
    static create(editor, content) {
        const elem = createDocumentElement(INSTANCE_TYPE.TEXT_ELEMENT);
        const instance = new TextElement();
        instance._editor = editor;
        instance.attach(elem);
        if(content) {
            instance.setSource(content);
        }
        return instance;
    }
    static TYPE = INSTANCE_TYPE.TEXT_ELEMENT;

    source = ''

    setSource(content) {
        const editor = this._editor;
        const tokens = editor.lang.highlight(content);
        console.log(tokens)
        this.source = content;
        this.documentElement.innerHTML = tokenToHTML(tokens).join('');
    }

    getLength() {
        return this.source.length;
    }

    serialize() {
        return {
            type: INSTANCE_TYPE.TEXT_ELEMENT,
            source: this.source
        }
    }
}

export default TextElement;