import Command from "./base";
import { 
    findParent, getAncestors, getPathOfInstance
} from "../utils";
import { KEYBOARD_COMMANDS, INSTANCE_TYPE, OPERRATION } from "../constants";
import EditLine from '../instance/edit-line';
import TextElement from '../instance/text-element';
import { DeleteInLine, DeleteInEditarea, BatchAction } from '../infrastructure/undoredo';

export class DeleteCommand extends Command {
    static name = KEYBOARD_COMMANDS.DELTET;
    
    deleteSelection() {
        const editor = this._editor;
        const range = editor.range;
        const undoredo = editor.undoredo;
        const selections = range.getSelections();
        const caret = editor.caret;
        
        if(selections.length > 0) {
            const batch = new BatchAction();
            batch.recordBeforeCaret(caret);
            const [element, offset] = range._delete(batch);
            caret.focus(element, offset);
            range.clear();
            batch.recordAfterCaret(caret);
            undoredo.write(batch);
            return true;
        }
    }

    exec() {
        if(this.deleteSelection()){
            return;
        }

        const editor = this._editor;
        const caret = editor.caret;
        const undoredo = editor.undoredo;
        const {
            textElement,
            offset,
            // _ensureDeleteComposite,
        } = caret.status;
        // if(_ensureDeleteComposite) {
        //     const line = findParent(_ensureDeleteComposite, INSTANCE_TYPE.LINE);
        //     const element_idx = line.findIndex(_ensureDeleteComposite);
        //     const preElement = line.getChild(element_idx-1);
        //     const afterElement = line.getChild(element_idx+1);
        //     if(preElement instanceof TextElement && afterElement instanceof TextElement) {
        //         // 默认 composite 两侧均为 textElement
        //         const offset = preElement.source.length;
                

        //         this.undoredoInline(_ensureDeleteComposite, line, 
        //             preElement, offset,
        //             afterElement, 0);
        //         preElement.setSource(preElement.source + afterElement.source);
        //         line.splice(element_idx, 2);
        //         caret.focus(preElement, offset);
        //     } 
        //     return;
        // }

        const batch = new BatchAction();
        batch.recordBeforeCaret(caret);
        const line = findParent(textElement, INSTANCE_TYPE.LINE);
        const content = textElement.source;
        const preContent = content.substring(0, offset);
        const afterContent = content.substring(offset);
        if(offset > 0) {
            textElement.setSource(
                preContent.substring(0, preContent.length-1) + afterContent, 
                batch);
            const nextOffset = offset - 1;
            // undoredo
            // this.undoredoInline( batch,
            //     preContent[preContent.length-1], line, 
            //     textElement, nextOffset,
            //     textElement, offset);
            caret.focus(textElement, nextOffset);
            batch.recordAfterCaret(caret);
            undoredo.write(batch);
            return;
        }

        const element_idx = line.findIndex(textElement);
        if(element_idx > 0) {
            // ---- text composite text composite 一直保持 ----
            const preElement = line.getChild(element_idx - 1);
            const prepreElement = line.getChild(element_idx - 2);
            const startNumber = element_idx - 1;
            // if(prepreElement && prepreElement instanceof TextElement) {
                const preoffset = prepreElement.source.length;
                
                // this.undoredoInline(preElement, line, 
                //     prepreElement, preoffset,
                //     textElement, 0);
                prepreElement.setSource(prepreElement.source + afterContent, batch)
                line.splice(batch, startNumber, 2);
                caret.focus(prepreElement, preoffset);
                batch.recordAfterCaret(caret);
                undoredo.write(batch);
            // } else {
            //     line.splice(startNumber, 1);
            //     caret.focus(textElement, 0);
            // }
            return;
        }

        const editarea = findParent(line, INSTANCE_TYPE.EDIT_AREA);
        const line_idx = editarea.findIndex(line);
        if(line_idx > 0) {
            // in one editarea find prev line last TextElement
            const preLine = editarea.getChild(line_idx - 1);
            const lastElement = preLine.getLastChild(); // ensure textElement
            if(!lastElement instanceof TextElement) {
                throw 'line not end with textelement!'
            }
            editarea.splice(batch, line_idx, 1);
            const afterElements = line.slice(1);
            const l = lastElement.source.length;
            if(afterContent) {
                lastElement.setSource(lastElement.source + afterContent, );
            }
            if(afterElements.length > 0) {
                preLine.splice(batch, preLine.getLength(), 0, ...afterElements);
            }
            
            // const undoredo = this._editor.undoredo;
            // undoredo.write(new DeleteInEditarea({
            //     textElement: lastElement,
            //     offset: l,
            // }));

            caret.focus(lastElement, l);
            batch.recordAfterCaret(caret);
            undoredo.write(batch);
            return;
        }

        // const composite = findParent(editarea, INSTANCE_TYPE.COMPOSITE);
        // if(composite) {
        //     caret.setEnsureDeleteComposite(composite);
        // }
    }
}