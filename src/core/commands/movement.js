import Command from "./base";
import { 
    findParent,
    queryChildren, 
    findElementWithRelativeCondition,
    getBoundingBoxCenterY,
    calculateTextOffset,
    calculateTextWidth
} from "../utils";
import { INSTANCE_TYPE, KEYBOARD_COMMANDS, JEDITOR_SYMBOL } from '../constants';
import { getLastTextElementFromInstance, getFirstTextElementFromInstance } from "../instance/utils";

function findLastTextElementInLineElement(lineElement){
    if(lineElement.constructor.TYPE === INSTANCE_TYPE.TEXT_ELEMENT) {
        return lineElement
    }
    const children = queryChildren(lineElement, INSTANCE_TYPE.TEXT_ELEMENT);
    if(children.length === 0) {
        return null;
    }
    if(children.length === 1) {
        return children[0].instane
    }
    const target = findElementWithRelativeCondition({
        targetElements: children, 
        start: -Infinity, 
        factor: i => i.documentElement.getBoundingClientRect().right,
        condition: (a, b) => a > b
    })
    return target.instane;
}
console.log(KEYBOARD_COMMANDS.ARROW_LEFT)
export class ArrowLeftCommand extends Command {
    static name = KEYBOARD_COMMANDS.ARROW_LEFT;
    
    exec() {
        this._editor.range.clear();
        const caret = this._editor.caret;
        const {
            textElement,
            offset
        } = caret.status;

        if(offset > 0) {
            caret.focus(textElement, offset-1);
            return;
        }

        const line = findParent(textElement, INSTANCE_TYPE.LINE);
        const element_idx = line.findIndex(textElement);
        if(element_idx > 0) {
            // in one line find prev TextElement
            const preElement = line.getChild(element_idx - 1);
            const instance = findLastTextElementInLineElement(preElement);
            if(instance) {
                caret.focus(instance, instance.source.length);
                return;
            }
        } 

        const editarea = findParent(line, INSTANCE_TYPE.EDIT_AREA);
        const line_idx = editarea.findIndex(line);
        if(line_idx > 0) {
            // in one editarea find prev line last TextElement
            const preLine = editarea.getChild(line_idx - 1);
            const lastElement = preLine.getLastChild();
            const instance = findLastTextElementInLineElement(lastElement);
            if(instance) {
                caret.focus(instance, instance.source.length);
                return;
            }
        }

        const composite = findParent(editarea, INSTANCE_TYPE.COMPOSITE);
        if(composite) {
            const areas = composite.getChildren().slice().sort((_a, _b) => {
                const a = _a.documentElement.getBoundingClientRect();
                const b = _b.documentElement.getBoundingClientRect();
                if (a.top === b.top) {
                  return a.left - b.left;
                } else {
                  return a.top - b.top;
                }
            });
            
            const idx = areas.findIndex(ar => ar === editarea);
            const nextEditArea = areas[idx-1];
            if(nextEditArea) {
                const currArea = editarea.documentElement.getBoundingClientRect();
                const lines = nextEditArea.getChildren();
                const currAreaY = getBoundingBoxCenterY(currArea); 
                const line = findElementWithRelativeCondition({
                    targetElements: lines, 
                    factor: i => i.documentElement.getBoundingClientRect(),
                    condition: (box, curr) => Math.abs(getBoundingBoxCenterY(box) - currAreaY) <  Math.abs(getBoundingBoxCenterY(curr) - currAreaY),
                    filter: i => i !== editarea,
                });
                const lastElement = line.getLastChild();
                const instance = findLastTextElementInLineElement(lastElement);
                if(instance) {
                    caret.focus(instance, instance.source.length);
                    return;
                }
            }

            const parentLine = findParent(composite, INSTANCE_TYPE.LINE);
            const composite_idx = parentLine.findIndex(composite);
            if(composite_idx > 0) {
                const preElement = parentLine.getChild(composite_idx - 1);
                const instance = findLastTextElementInLineElement(preElement);
                if(instance) {
                    caret.focus(instance, instance.source.length);
                    return;
                }
            }
        }
    }
}


function findFirstTextElementInLineElement(lineElement){
    if(lineElement.constructor.TYPE === INSTANCE_TYPE.TEXT_ELEMENT) {
        return lineElement
    }
    const children = queryChildren(lineElement, INSTANCE_TYPE.TEXT_ELEMENT);
    if(children.length === 0) {
        return null;
    }
    if(children.length === 1) {
        return children[0].instane
    }
    const target = findElementWithRelativeCondition({
        targetElements: children, 
        start: Infinity, 
        factor: i => i.documentElement.getBoundingClientRect().left,
        condition: (a, b) => a < b
    })
    return target.instane;
}

export class ArrowRightCommand extends Command {
    static name = KEYBOARD_COMMANDS.ARROW_RIGHT;
    exec() {
        const caret = this._editor.caret;
        this._editor.range.clear();
        const {
            textElement,
            offset
        } = caret.status;

        if(offset < textElement.getLength()) {
            caret.focus(textElement, offset+1);
            return;
        }

        const line = findParent(textElement, INSTANCE_TYPE.LINE);
        const element_idx = line.findIndex(textElement);
        if(element_idx + 1 < line.getLength()) {
            // in one line find prev TextElement
            const nextElement = line.getChild(element_idx + 1);
            const instance = findFirstTextElementInLineElement(nextElement);
            if(instance) {
                caret.focus(instance, 0);
                return;
            }
        } 

        const editarea = findParent(line, INSTANCE_TYPE.EDIT_AREA);
        const line_idx = editarea.findIndex(line);
        if(line_idx + 1 < editarea.getLength()) {
            // in one editarea find prev line last TextElement
            const nextLine = editarea.getChild(line_idx + 1);
            const nextElement = nextLine.getFirstChild();
            const instance = findFirstTextElementInLineElement(nextElement);
            if(instance) {
                caret.focus(instance, 0);
                return;
            }
        }

        const composite = findParent(editarea, INSTANCE_TYPE.COMPOSITE);
        if(composite) {
            const areas = composite.getChildren().slice().sort((_a, _b) => {
                const a = _a.documentElement.getBoundingClientRect();
                const b = _b.documentElement.getBoundingClientRect();
                if (a.top === b.top) {
                  return a.left - b.left;
                } else {
                  return a.top - b.top;
                }
            });
            const idx = areas.findIndex(ar => ar === editarea);
            const nextEditArea = areas[idx+1];
            if(nextEditArea) {
                const currArea = editarea.documentElement.getBoundingClientRect();
                const lines = nextEditArea.getChildren();
                const currAreaY = getBoundingBoxCenterY(currArea);
                const line = findElementWithRelativeCondition({
                    targetElements: lines, 
                    factor: i => i.documentElement.getBoundingClientRect(),
                    condition: (box, curr) => Math.abs(getBoundingBoxCenterY(box) - currAreaY) <  Math.abs(getBoundingBoxCenterY(curr) - currAreaY),
                    filter: i => i !== editarea,
                });
                const firstElement = line.getFirstChild();
                const instance = findFirstTextElementInLineElement(firstElement);
                if(instance) {
                    caret.focus(instance, 0);
                    return;
                }
            }

            const parentLine = findParent(composite, INSTANCE_TYPE.LINE);
            const composite_idx = parentLine.findIndex(composite);
            if(composite_idx + 1 < parentLine.getLength()) {
                const nextElement = parentLine.getChild(composite_idx + 1);
                const instance = findFirstTextElementInLineElement(nextElement);
                if(instance) {
                    caret.focus(instance, 0);
                    return;
                }
            }
        }

        
    }
}
    

export class ArrowUpCommand extends Command {
    static name = KEYBOARD_COMMANDS.ARROW_UP;
    exec() {
        if(this._editor.autocompletion.isActive) {
            this._editor.autocompletion.up();
            return
        }
        this._editor.range.clear();
        const caret = this._editor.caret;
        const {
            textElement,
            offset
        } = caret.status;

        const currBox = textElement.documentElement.getBoundingClientRect();
        const currBoxY = getBoundingBoxCenterY(currBox);
        const textElements = this._editor.contentElement.querySelectorAll(INSTANCE_TYPE.TEXT_ELEMENT);
        let i = 0;
        const l = textElements.length;
        let min = Infinity;
        let y, t, el;
        while(i < l) {
            const elem = textElements[i];
            const box = elem.getBoundingClientRect();
            y = getBoundingBoxCenterY(box);
            if(y < currBoxY && (t = currBoxY - y) <= min) {
                min = t;
                el = elem;
            }
            i++;
        }

        if(el) {
            const textElem = el[JEDITOR_SYMBOL];
            const { monospace, monospacedouble } = this._editor.getEditorContext();
            const textWidth = calculateTextWidth(textElem.source, 0, offset, monospace, monospacedouble); 
            // const boxContent = this._editor.getContentBoundingClientRect();
            // let tx = x - boxContent.x + textWidth;
            const tx = currBox.left + textWidth;
            const elemBox = el.getBoundingClientRect();
            if(tx < elemBox.left) {
                caret.focus(textElem, 0);
                return;
            }
            if(tx > elemBox.right) {
                caret.focus(textElem, textElem.getLength());
                return;
            }
            const nextOffset = calculateTextOffset(textElem.source, tx - elemBox.left, monospace, monospacedouble)
            caret.focus(textElem, nextOffset);
            return;
        }
    }
}

export class ArrowDownCommand extends Command {
    static name = KEYBOARD_COMMANDS.ARROW_DOWN;
    exec() {
        if(this._editor.autocompletion.isActive) {
            this._editor.autocompletion.up();
            return
        }
        const caret = this._editor.caret;
        this._editor.range.clear();
        const {
            textElement,
            offset
        } = caret.status;

        const currBox = textElement.documentElement.getBoundingClientRect();
        const currBoxY = getBoundingBoxCenterY(currBox);
        const textElements = this._editor.contentElement.querySelectorAll(INSTANCE_TYPE.TEXT_ELEMENT);
        let i = 0;
        const l = textElements.length;
        let min = Infinity;
        let y, t, el;
        while(i < l) {
            const elem = textElements[i];
            const box = elem.getBoundingClientRect();
            y = getBoundingBoxCenterY(box);
            if(y > currBoxY && (t = y - currBoxY) <= min) {
                min = t;
                el = elem;
            }
            i++;
        }

        if(el) {
            const textElem = el[JEDITOR_SYMBOL];
            const { monospace, monospacedouble } = this._editor.getEditorContext();
            const textWidth = calculateTextWidth(textElem.source, 0, offset, monospace, monospacedouble); 
            // const boxContent = this._editor.getContentBoundingClientRect();
            // let tx = x - boxContent.x + textWidth;
            const tx = currBox.left + textWidth;
            const elemBox = el.getBoundingClientRect();
            if(tx < elemBox.left) {
                caret.focus(textElem, 0);
                return;
            }
            if(tx > elemBox.right) {
                caret.focus(textElem, textElem.getLength());
                return;
            }
            const nextOffset = calculateTextOffset(textElem.source, tx - elemBox.left, monospace, monospacedouble)
            caret.focus(textElem, nextOffset);
            return;
        }
    }
}

export class TabCommand extends Command {
    static name = KEYBOARD_COMMANDS.TAB;
    
    exec() {
        debugger
        const editor = this._editor;
        const caret = this._editor.caret;
        const range = this._editor.range;
        const {
            textElement,
        } = caret.status;
        const composite = findParent(textElement, INSTANCE_TYPE.COMPOSITE);
        if(composite) {
            const editarea = findParent(textElement, INSTANCE_TYPE.EDIT_AREA);
            const areas = composite.getChildren().slice().sort((_a, _b) => {
                const a = _a.documentElement.getBoundingClientRect();
                const b = _b.documentElement.getBoundingClientRect();
                if (a.top === b.top) {
                  return a.left - b.left;
                } else {
                  return a.top - b.top;
                }
            });
            const idx = areas.findIndex(ar => ar === editarea);
            const l = areas.length
            const nextEditArea = areas[(idx+1)%l];
            if(nextEditArea) {
                const a = getFirstTextElementFromInstance(nextEditArea);
                const b = getLastTextElementFromInstance(nextEditArea);
                range.clear();
                range.setInitialBoundary({
                    textElement: a,
                    offset: 0
                });
                range.setCurrentBoundary({
                    textElement: b,
                    offset: b.getLength()
                });
                editor.resolveRange();
                editor.caret.focus(b, b.getLength());
            }
        }
    }
}