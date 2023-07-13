import Command from "./base";
import { 
    findParent, 
} from "../utils";
import { KEYBOARD_COMMANDS, INSTANCE_TYPE } from "../constants";
import EditLine from '../instance/edit-line';
import TextElement from '../instance/text-element';
import { ReturnInput, CompositeInsert } from '../infrastructure/undoredo';
import { BatchAction } from "../infrastructure/undoredo";
import {
    getFirstTextElementFromInstance
} from '../instance/utils';


export class ReturnCommand extends Command {
    static name = KEYBOARD_COMMANDS.RETURN;
    exec() {
        const editor = this._editor;
        const caret = editor.caret;
        const undoredo = editor.undoredo;
        const {
            textElement,
            offset
        } = caret.status;
        const batchAction = new BatchAction();
        batchAction.recordBeforeCaret(caret);

        if(editor.autocompletion.isActive) {
            const completion = editor.autocompletion.select();
            const composite = completion.put(editor);
            // const op = new CompositeInsert({
            //     composite,
            //     textElement,
            //     offset,
            //     token: this._editor.lang._lastToken,
            // });
            // undoredo.write(op);

            // op.redo(this._editor);
            const token = this._editor.lang._lastToken;
            const tokenLength = token.content.length;
            // const textElement = queryInstanceByPath(this.path, editor.editareaRoot);
            const editline = findParent(textElement, INSTANCE_TYPE.LINE);
            const text_idx = editline.findIndex(textElement);
            const content = textElement.source;
            const preContent = content.substring(0, offset - tokenLength);
            const afterContent = content.substring(offset);
            textElement.setSource(preContent, batchAction);
            const newTxt = TextElement.create(editor, afterContent);
            editline.splice(batchAction, text_idx + 1, 0, composite, newTxt);
            const text = getFirstTextElementFromInstance(composite);
            editor.range.clear();
            editor.caret.focus(text);

            editor.autocompletion.replaceItems([]);
            batchAction.recordAfterCaret(caret);
            undoredo.write(batchAction);
            return
        }
        
        const line = findParent(textElement, INSTANCE_TYPE.LINE);
        const area = findParent(line, INSTANCE_TYPE.EDIT_AREA);
        const idx = area.findIndex(line);
        const content = textElement.source;
        const preContent = content.substring(0, offset);
        const afterContent = content.substring(offset);
        textElement.setSource(preContent, batchAction);
        const newTextElement = TextElement.create(editor, afterContent);
        const newline = EditLine.create(editor);
        const startidx = line.findIndex(textElement) + 1;
        const remainElemens = line.splice(batchAction, startidx, line.getLength() - startidx);
        newline.splice(batchAction, 0, 0, newTextElement, ...remainElemens);
        
        area.splice(batchAction, idx+1, 0, newline);
        editor.range.clear();
        editor.caret.focus(newTextElement);

        batchAction.recordAfterCaret(caret);
        undoredo.write(batchAction);
    }
}