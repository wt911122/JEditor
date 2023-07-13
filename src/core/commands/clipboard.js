import Command from "./base";
import { INSTANCE_TYPE } from '../constants'
import { KEYBOARD_COMMANDS } from '../constants';
import { 
    findParent, getAncestors, getPathOfInstance
} from "../utils";
import TextElement from "../instance/text-element";
import EditLine from "../instance/edit-line";
import { BatchAction } from '../infrastructure/undoredo'

const ClipBoard = {
    payload: undefined,
}
function clearClipboard() {
    ClipBoard.payload = undefined;
}
function readClipboard() {
    return ClipBoard.payload;
}
function writeClipboard(payload) {
    return ClipBoard.payload = payload;
}
function isClipboardEmpty() {
    return !ClipBoard.payload
}

export class CopyCommand extends Command {
    static name = KEYBOARD_COMMANDS.COPY;
    exec() {
        const editor = this._editor;
        const range = editor.range;
        const selections = range.getSelections();
        if(selections.length > 0) {
            const payload = [];
            selections.forEach(select => {
                if(select.type === INSTANCE_TYPE.COMPOSITE) {
                    payload.push(select.scope.serialize());
                }
                if(select.type === INSTANCE_TYPE.TEXT_ELEMENT) {
                    const content = select.scope.source.substring(...select.offset)
                    payload.push(() => TextElement.create(editor, content));
                }
            });
            console.log(payload);
            writeClipboard(payload);
        }
    }
}

export class PasteCommand extends Command {
    static name = KEYBOARD_COMMANDS.PASTE;
    exec() {
        if(isClipboardEmpty()){
            return;
        }
        const editor = this._editor;
        const undoredo = editor.undoredo;
        const caret = editor.caret;
        const range = editor.range;
        const batch = new BatchAction();
        batch.recordBeforeCaret(caret);
        const selections = range.getSelections();
        if(selections.length > 0) {
            const [element, offset] = range._delete(batch);
            caret.focus(element, offset);
            range.clear();
        }

        const {
            textElement,
            offset,
        } = caret.status;
        const content = textElement.source;
        const preContent = content.substring(0, offset);
        const afterContent = content.substring(offset);

        const payload = readClipboard();
        const firstTextElement = payload[0]();
        textElement.setSource(preContent + firstTextElement.source, batch);
        let current_line = findParent(textElement, INSTANCE_TYPE.LINE);
        const current_area = findParent(current_line, INSTANCE_TYPE.EDIT_AREA);
        let txt_idx = current_line.findIndex(textElement);
        const remains = current_line.slice(txt_idx+1);

        let line_idx = current_area.findIndex(current_line);
        let count = 0;
        payload.slice(1).forEach(fac => {
            const c = fac();
            if(c instanceof TextElement) {
                count++;
                if(count === 2) {
                    // 插入行
                    const line = EditLine.create(editor);
                    current_area.splice(batch, line_idx+1, 0, line);
                    current_line = line;
                    txt_idx = -1;
                    line_idx++;
                }
            } else {
                count = 0;
            }
            current_line.splice(batch, txt_idx+1, 0, c);
            txt_idx++;
        });

        const elem = current_line.getLastChild();
        const offsetAfter = elem.getLength();
        elem.setSource(elem.source + afterContent, batch);

        current_line.splice(batch, txt_idx+1, 0, ...remains);

        caret.focus(elem, offsetAfter);

        batch.recordAfterCaret(caret);
        undoredo.write(batch);
    }
}