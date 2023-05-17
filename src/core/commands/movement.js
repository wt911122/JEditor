import Command from "./base";
import { 
    findParent,
    queryChildren, 
    findElementWithRelativeCondition,
    getBoundingBoxCenterY
} from "../utils";
import { INSTANCE_TYPE, KEYBOARD_COMMANDS } from '../constants';

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
            const areas = composite.getChildren();
            const currArea = editarea.documentElement.getBoundingClientRect();
            const nextEditArea = findElementWithRelativeCondition({
                targetElements: areas, 
                factor: i => i.documentElement.getBoundingClientRect(),
                condition:  (box, cur) => (box.right < currArea.left) && (currArea.left - box.right < cur.left - box.right),
                filter: i => i !== editarea,
            });
            if(nextEditArea) {
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
            const areas = composite.getChildren();
            const currArea = editarea.documentElement.getBoundingClientRect();
            const nextEditArea = findElementWithRelativeCondition({
                targetElements: areas, 
                factor: i => i.documentElement.getBoundingClientRect(),
                condition:  (box, cur) => (box.left > currArea.right) && (currArea.right - box.left < cur.right - box.left),
                filter: i => i !== editarea,
            });
            if(nextEditArea) {
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
    }
}

export class ArrowDownCommand extends Command {
    static name = KEYBOARD_COMMANDS.ARROW_DOWN;
    exec() {
        if(this._editor.autocompletion.isActive) {
            this._editor.autocompletion.down();
            return
        }
    }
}