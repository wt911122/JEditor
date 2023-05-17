import { INSTANCE_TYPE, JEDITOR_RANGE, JEDITOR_SELECTION, OPERRATION } from '../constants'
import Composite from '../instance/composite';
import TextElement from '../instance/text-element';
import EditLine from '../instance/edit-line';
import { getFirstTextElementFromInstance, splitTextElementContent } from '../instance/utils';
import { findParent, getPathOfInstance, queryInstanceByPath, findNextSibling, findFirstCommonParentNode, findPreviousSibling } from '../utils';

export default class UndoRedo {
    static length = 50;
    _undo = [];
    _redo = [];
    _editor = null;

    write(x) {
        this._undo.push(x);
        if(this._undo.length > UndoRedo.length) {
            this._undo.splice(0, 1);
        }
        if(this._redo.length) {
            this._redo = [];
        }
    }

    getLastUndo() {
        return this._undo[this._undo.length - 1];
    }

    undo() {
        const x = this._undo.pop();
        if(x) {
            x.undo(this._editor)
            this._redo.push(x);
        }
        return x;
    }

    redo() {
        let x = this._redo.pop();
        while(x && x.SKIP_REDO) {
            x = this._redo.pop();
        }
        if(x) {
            x.redo(this._editor)
            this._undo.push(x);
        }
        return x;
    }
}


export class PlainInput {
    type = OPERRATION.PLAININPUT
    content = ""
    path = null
    offset = 0
    constructor(meta) {
        this.path = getPathOfInstance(meta.textElement);
        this.offset = meta.offset;
        this.content = meta.content;
    }

    append(content) {
        this.content += content;
    }

    undo(editor) {
        const textElement = queryInstanceByPath(this.path, editor.editareaRoot);
        const c = textElement.source;
        const offsetTo = this.offset + this.content.length;
        textElement.setSource(c.substring(0, this.offset) + c.substring(offsetTo));
        editor.range.clear();
        editor.caret.focus(textElement, this.offset);
    }

    redo(editor) {
        const textElement = queryInstanceByPath(this.path, editor.editareaRoot);
        const c = textElement.source;
        const offsetFrom = this.offset;
        const offsetTo = offsetFrom + this.content.length;
        textElement.setSource(c.substring(0, offsetFrom) + this.content + c.substring(offsetFrom));
        editor.range.clear();
        editor.caret.focus(textElement, offsetTo);
    }

    isSame(type, textElement, offset, editor) {
        // debugger
        // console.log(offset, this.content.length + this.offset)
        const t = queryInstanceByPath(this.path, editor.editareaRoot);
        return type === this.type && textElement === t && (this.offset + this.content.length === offset)
    }
}

export class SpaceInput extends PlainInput {
    type = OPERRATION.SPACEINPUT
}

export class CompositeInsert {
    type = OPERRATION.COMPOSITE_INSERT;
    path = null
    offset = 0
    composite = null;
    token = '';
    constructor(meta) {
        this.path = getPathOfInstance(meta.textElement);
        this.offset = meta.offset;
        this.token = meta.token;
        this.composite = meta.composite;
    }
    undo(editor) {
        const editline = findParent(this.composite, INSTANCE_TYPE.LINE);
        const composite_idx = editline.findIndex(this.composite);
        const nextText = editline.getChild(composite_idx+1);
        const preText = editline.getChild(composite_idx-1);
        const tokenContent = this.token.content;
        preText.setSource(preText.source + tokenContent + nextText.source);
        editline.splice(composite_idx, 2);
        editor.range.clear();
        editor.caret.focus(preText, this.offset);
    }
    redo(editor) {
        console.log(this.token)
        // const tokenoffset = this.token.index;
        const tokenLength = this.token.content.length;
        const textElement = queryInstanceByPath(this.path, editor.editareaRoot);
        const editline = findParent(textElement, INSTANCE_TYPE.LINE);
        const text_idx = editline.findIndex(textElement);
        const content = textElement.source;
        const preContent = content.substring(0, this.offset - tokenLength);
        const afterContent = content.substring(this.offset);
        textElement.setSource(preContent);
        const newTxt = TextElement.create(editor, afterContent);
        editline.splice(text_idx + 1, 0, this.composite, newTxt);
        const text = getFirstTextElementFromInstance(this.composite);
        console.log(text)
        editor.range.clear();
        editor.caret.focus(text);
    }
}

export class ReturnInput {
    type = OPERRATION.RETURNINPUT
    path = []
    offset = 0
    constructor(meta) {
        this.path = getPathOfInstance(meta.textElement);
        this.offset = meta.offset;
    }

    _return(editor) {
        const textElement = queryInstanceByPath(this.path, editor.editareaRoot);
        const line = findParent(textElement, INSTANCE_TYPE.LINE);
        const area = findParent(line, INSTANCE_TYPE.EDIT_AREA);
        const idx = area.findIndex(line);
        const content = textElement.source;
        const preContent = content.substring(0, this.offset);
        const afterContent = content.substring(this.offset);
        textElement.setSource(preContent);
        const newTextElement = TextElement.create(editor, afterContent);
        const newline = EditLine.create(editor);
        const startidx = line.findIndex(textElement) + 1;
        const remainElemens = line.splice(startidx, line.getLength() - startidx);
        newline.splice(0, 0, newTextElement, ...remainElemens);
        
        area.insert(newline, idx+1);
        editor.range.clear();
        editor.caret.focus(newTextElement);
    }

    _unRetrun(editor) {
        const textElement = queryInstanceByPath(this.path, editor.editareaRoot);
        const line = findParent(textElement, INSTANCE_TYPE.LINE);
        const area = findParent(line, INSTANCE_TYPE.EDIT_AREA);
        const lineidx = area.findIndex(line);
        const nextlineidx = lineidx + 1;
        const nextline = area.getChild(nextlineidx);
        if(nextline) {
            const nextTextElement = getFirstTextElementFromInstance(nextline);
            textElement.setSource(textElement.source + nextTextElement.source);
            line.splice(line.getLength(), 0, ...nextline.slice(1));
            area.splice(nextlineidx, 1);
        }
        
        editor.range.clear();
        editor.caret.focus(textElement, this.offset);
    }

    undo(editor) {
        this._unRetrun(editor);
    }

    redo(editor) {
        this._return(editor);
    }

    isSame(type, textElement, offset, editor) {
        // debugger
        // console.log(offset, this.content.length + this.offset)
        // const t = queryInstanceByPath(this.path, editor.editareaRoot);
        return type === this.type;
    }
}

export class DeleteInLine {
    type = OPERRATION.DELETE_IN_LINE
    linepath = []
    from = {
        textpath: [],
        offset: 0
    }
    to = {
        textpath: [],
        offset: 0
    }
    deleteitems = [];
    constructor(meta) {
        this.linepath = getPathOfInstance(meta.editline);
        this.from = {
            textpath: getPathOfInstance(meta.textElement),
            offset: meta.offset,
        }
    }

    append(item) {
        if(item instanceof Composite) {
            this.deleteitems.unshift(item);
        } else {
            const lastItem = this.deleteitems[0];
            if(typeof lastItem === 'string') {
                this.deleteitems[0] = item + lastItem;
            } else {
                this.deleteitems.unshift(item);
            }
        }
    }

    setToPosition(textElement, offset) {
        this.to = {
            textpath: getPathOfInstance(textElement),
            offset,
        }
    }

    undo(editor) {
        const editline = queryInstanceByPath(this.linepath, editor.editareaRoot);
        console.log(editline)
        const textElementTo = queryInstanceByPath(this.to.textpath, editor.editareaRoot);
        const preContent = textElementTo.source.substring(0, this.to.offset);
        const afterContent = textElementTo.source.substring(this.to.offset);
        textElementTo.setSource(preContent);
        const textToIdx = editline.findIndex(textElementTo);
        let lastItem = textElementTo;
        let idx = textToIdx;
        this.deleteitems.forEach(item => {
            if(typeof item === 'string') {
                if(lastItem instanceof TextElement) {
                    lastItem.setSource(lastItem.source + item);
                } else {
                    idx ++;
                    lastItem = TextElement.create(editor, item);
                    editline.insert(lastItem, idx);
                }
            } else {
                idx ++;
                editline.insert(item, idx);
                lastItem = item;
            }
        });
        editor.range.clear();
        if(lastItem instanceof TextElement) {
            const offset = lastItem.source.length;
            lastItem.setSource(lastItem.source + afterContent);
            editor.caret.focus(lastItem, offset);
        } else {
            const next = editline.getChild(textToIdx + 1);
            if(!next || next instanceof Composite) {
                lastItem = TextElement.create(editor, afterContent);
                editline.insert(lastItem, idx + 1);
                editor.caret.focus(lastItem, 0);
            } else {
                const offset = next.source.length;
                next.setSource(next.source + afterContent);
                editor.caret.focus(next, offset);
            }
            
        }
    }

    redo(editor) {
        const editline = queryInstanceByPath(this.linepath, editor.editareaRoot);
        const textElementFrom = queryInstanceByPath(this.from.textpath, editor.editareaRoot);
        const textElementIdxFrom = editline.findIndex(textElementFrom);
        const afterContent = textElementFrom.source.substring(this.from.offset);
        const textElementTo = queryInstanceByPath(this.to.textpath, editor.editareaRoot);
        const textElementIdxTo = editline.findIndex(textElementTo);
        const preContent = textElementTo.source.substring(0, this.to.offset);
        
        textElementTo.setSource(preContent + afterContent);
        editline.splice(textElementIdxTo + 1, textElementIdxFrom - textElementIdxTo);
        editor.range.clear();
        editor.caret.focus(textElementTo, preContent.length);
    }

    isSame(editline, textElement, offset, editor) {
        const curline = queryInstanceByPath(this.linepath, editor.editareaRoot);
        if(editline!== curline) {
            return false;
        }
        const currelement = queryInstanceByPath(this.to.textpath, editor.editareaRoot);
        if(textElement!== currelement) {
            return false;
        }
        return offset === this.to.offset;
    }
}

export class DeleteInEditarea extends ReturnInput {
    type = OPERRATION.DELETE_IN_EDITAREA
    undo(editor) {
        this._return(editor);
    }

    redo(editor) {
        this._unRetrun(editor);
    }
}

export class SelectionDelete extends DeleteInLine {
    type = OPERRATION.SELECTION_DELETE
    _selections = [];
    _endPath = [];
    _endoffset = 0
    resolveSelections(selections) {
        let edirarea;
        let newline = false;
        let lastLine;
        this._selections = selections.map(s => {
            const line = findParent(s.scope, INSTANCE_TYPE.LINE)
            newline = false;
            if(!lastLine) {
                lastLine = line
            } 
            if(lastLine !== line) {
                lastLine = line;
                newline = true;
            }
            
            if(!edirarea) {
                edirarea = findParent(s.scope, INSTANCE_TYPE.EDIT_AREA)
            }
            if(s.type === INSTANCE_TYPE.TEXT_ELEMENT) {
                return {
                    type: INSTANCE_TYPE.TEXT_ELEMENT,
                    content: s.scope.source.substring(s.offset[0], s.offset[1]),
                    newline,
                }
            } 
            return {
                type: INSTANCE_TYPE.COMPOSITE,
                composite: s.scope,
                newline,
            }
        })
    }

    constructor(meta) {
        super(meta)
        this.resolveSelections(meta.selections);
        this._endPath = getPathOfInstance(meta.endTextElement);
        this._endoffset = meta.endOffset;
    }

    undo(editor) {
        super.undo(editor);
        // from is delete begin position, range end position
        const selections = this._selections;
        const editline = queryInstanceByPath(this.linepath, editor.editareaRoot);
        const edirarea = findParent(editline, INSTANCE_TYPE.EDIT_AREA);
        const textElementFrom = queryInstanceByPath(this.from.textpath, editor.editareaRoot);
        const [preContent, afterContent] = splitTextElementContent(textElementFrom, this.from.offset);
        const a = selections[0];
        const b = selections[selections.length-1];
        textElementFrom.setSource(preContent + a.content);
        const textElementTo = TextElement.create(editor, b.content + afterContent);
        let textidx = editline.findIndex(textElementFrom);
        const remain = editline.splice(textidx + 1, editline.getLength() - textidx - 1);
        let line = editline;
        let elem_idx = textidx+1;
        let lineidx = edirarea.findIndex(editline)+1;
        selections.slice(1).forEach((s, idx) => {
            if(s.newline){
                const newline = EditLine.create(editor);
                edirarea.insert(newline, lineidx);
                line = newline;
                elem_idx = 0;
                lineidx++;
            }
            if(idx === selections.length-2) {
                line.insert(textElementTo, elem_idx)
                elem_idx++;
                return;
            }
            switch(s.type) {
                case INSTANCE_TYPE.TEXT_ELEMENT:
                    const text = TextElement.create(editor, s.content);
                    line.insert(text, elem_idx)
                    break;

                case INSTANCE_TYPE.COMPOSITE:
                    line.insert(s.composite, elem_idx);
                    break;
            }
            elem_idx ++;
        });
        remain.forEach(e => {
            line.insert(e, elem_idx);
            elem_idx++;
        })
        
        editor.caret.focus(textElementTo, b.content.length);
        editor.range.setInitialBoundary({
            textElement: textElementFrom,
            offset: preContent.length,
        });
        editor.range.setCurrentBoundary({
            textElement: textElementTo,
            offset: b.content.length,
        });
        editor.resolveRange();
    }
    redo(editor) {
        const textElementFrom = queryInstanceByPath(this.from.textpath, editor.editareaRoot);
        const textElementTo = queryInstanceByPath(this._endPath, editor.editareaRoot);
        const range = editor.range;
        range.setInitialBoundary({
            textElement: textElementFrom,
            offset: this.from.offset
        });
        range.setCurrentBoundary({
            textElement: textElementTo,
            offset: this._endoffset
        });
        editor.resolveRange();
        range._delete(true);
        super.redo(editor);
    }
}


