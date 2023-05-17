import Command from "./base";
import { 
    findParent,
} from "../utils";
import { KEYBOARD_COMMANDS, INSTANCE_TYPE } from "../constants";
import EditLine from '../instance/edit-line';
import TextElement from '../instance/text-element';
import { ReturnInput, CompositeInsert } from '../infrastructure/undoredo';


export class ReturnCommand extends Command {
    static name = KEYBOARD_COMMANDS.RETURN;
    exec() {
        const caret = this._editor.caret;
        const undoredo = this._editor.undoredo;
        const {
            textElement,
            offset
        } = caret.status;

        if(this._editor.autocompletion.isActive()) {
            const completion = this._editor.autocompletion.select();
            const composite = completion.put(this._editor);
            const op = new CompositeInsert({
                composite,
                textElement,
                offset,
                token: this._editor.lang._lastToken,
            });
            undoredo.write(op);

            op.redo(this._editor);
            this._editor.autocompletion.replaceItems([]);

            return
        }
        
        const op = new ReturnInput({
            textElement,
            offset,
        });
        undoredo.write(op);

        op.redo(this._editor);
        /*
        const content = textElement.source;
        const preContent = content.substring(0, offset);
        const afterContent = content.substring(offset);
        const line = findParent(textElement, INSTANCE_TYPE.LINE);
        const startidx = line.findIndex(textElement)+1;
        const remainElemens = line.splice(startidx, line.getLength() - startidx);
        undoredo.write()
        
        textElement.setSource(preContent);
        const newTextElement = TextElement.create(this._editor, afterContent);
        const newline = EditLine.create(this._editor);
        newline.splice(0, 0, newTextElement, ...remainElemens);
        
        const editarea = findParent(line, INSTANCE_TYPE.EDIT_AREA);
        const idx = editarea.findIndex(line);
        editarea.insert(newline, idx+1);
        
        caret.focus(newTextElement);*/
    }
}