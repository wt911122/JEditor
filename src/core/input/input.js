import { KEYBOARD_INPUT, OPERRATION } from '../constants';
import { PlainInput, SpaceInput } from '../infrastructure/undoredo';

export default class Input {
    composite_cache = null;
    _editor = null;

    undoredo(content, textElement, offset) {
        const isSpace = /^\s+$/.test(content);
        const undoredo = this._editor.undoredo;
        const last = undoredo.getLastUndo();
        if(isSpace) {
            if(last && last.type === OPERRATION.SPACEINPUT && last.isSame(OPERRATION.SPACEINPUT, textElement, offset, this._editor)) {
                last.append(content);
            } else {
                undoredo.write(new SpaceInput({
                    textElement,
                    offset,
                    content,
                }))
            }
        } else {
            if(last && last.type === OPERRATION.PLAININPUT && last.isSame(OPERRATION.PLAININPUT, textElement, offset, this._editor)) {
                last.append(content);
            } else {
                undoredo.write(new PlainInput({
                    textElement,
                    offset,
                    content,
                }))
            }
        }
    }

    handle(kind, data){
        const caret = this._editor.caret;
        const {
            textElement,
            offset
        } = caret.status;
        const content = textElement.source;
        let preContent = content.substring(0, offset);
        let afterContent 
        if(this.composite_cache) {
            afterContent = content.substring(this.composite_cache[1]);
        } else {
            afterContent = content.substring(offset);
        }

        switch(kind) {
            case KEYBOARD_INPUT.INPUT:
                preContent += data;
                textElement.setSource(preContent + afterContent);
                caret.forward(data.length);
                this.undoredo(data, textElement, offset);
                break;
            case KEYBOARD_INPUT.COMPOSITION_START:
                this.composite_cache = [preContent.length, preContent.length];
                break;
            case KEYBOARD_INPUT.COMPOSITION_UPDATE:
                preContent = preContent.substring(0, this.composite_cache[0]);
                preContent += data;
                this.composite_cache[1] = this.composite_cache[0] + data.length;
                textElement.setSource(preContent + afterContent);
                caret.setOffset(this.composite_cache[1]);
                break;
            case KEYBOARD_INPUT.COMPOSITION_END:
                preContent = preContent.substring(0, this.composite_cache[0]);
                textElement.setSource(preContent + data + afterContent);
                caret.setOffset(this.composite_cache[0] + data.length);
                this.composite_cache = null;
                this.undoredo(data, textElement, offset);
                break;
        }
    }
}