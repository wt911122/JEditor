import { getAncestors, findParent, calculateTextSelectionInRange, findPreviousSibling, findNextSibling, queryInstanceByPath, getPathOfInstance } from '../utils'
import { makeElement } from '../components/dom'; 
import { INSTANCE_TYPE, JEDITOR_RANGE, JEDITOR_SELECTION } from '../constants'
import EditLine from '../instance/edit-line';
import { SelectionDelete } from '../infrastructure/undoredo';
/*
 struct Selection {
    type: TEXT_ELEMENT | COMPOSITE
    scope: instance
    offset: [from, to]
 }
*/
class Range {
    static create(editor) {
        const elem = makeElement({
            tag: JEDITOR_RANGE,
            className: ['jeditor-range'],
        });
        const range = new Range();
        range._editor = editor;
        range.attach(elem)
        return range;
    }

    static renderSelections(selections, editorContext, contentBox) {
        const elements = [];
        selections.forEach(selection => {
            const instance =  selection.scope;
            const box = instance.documentElement.getBoundingClientRect()
            switch(selection.type) {
                case INSTANCE_TYPE.TEXT_ELEMENT:
                    const [a, b] = selection.offset;
                    const [ox, w] = calculateTextSelectionInRange(instance.source, a, b, editorContext.monospace, editorContext.monospacedouble);
                    elements.push(makeElement({
                        tag: JEDITOR_SELECTION,
                        className: ['jeditor-selection'],
                        style: {
                            transform: `matrix(${w}, 0, 0, ${box.height}, ${box.x + ox - contentBox.x}, ${box.y - contentBox.y})`
                        }
                    }))
                    break;
                case INSTANCE_TYPE.COMPOSITE:
                    elements.push(makeElement({
                        tag: JEDITOR_SELECTION,
                        className: ['jeditor-selection'],
                        style: {
                            transform: `matrix(${box.width}, 0, 0, ${box.height}, ${box.x - contentBox.x}, ${box.y - contentBox.y})`
                        }
                    }))
                    break;
            }
        });
        return elements;
    }

    _editor = null;
    _selections = [];
    initialBoundary = null;
    currentBoundary = null;

    attach(elem) {
        this.documentElement = elem;
    }

    render(elements) {
        this.documentElement.innerHTML = '';
        this.documentElement.append(...elements);
    }

    clear() {
        this.documentElement.innerHTML = '';
        this._selections = [];
        this.initialBoundary = null;
        this.currentBoundary = null;
    }

    setInitialBoundary(initialBoundary) {
        this.initialBoundary = initialBoundary;
    }

    setCurrentBoundary(currentBoundary) {
        this.currentBoundary = currentBoundary;
    }

    setSelections(selections) {
        this._selections = selections;
    }

    getSelections() {
        return this._selections;
    }

    resolveRange(editorContext, contentBox) {
        const selections = this._resolveRange();
        this._selections = selections;
        const elements = Range.renderSelections(selections, editorContext, contentBox);
        this.render(elements);
    }

    _resolveRange() {
        const {
            textElement: initElement,
            offset: initOffset
        } = this.initialBoundary;
        const {
            textElement: currentElement,
            offset: currentOffset
        } = this.currentBoundary;
        if(initElement === currentElement) {
            return [
                {   
                    scope: currentElement,
                    type: INSTANCE_TYPE.TEXT_ELEMENT,
                    offset: [Math.min(initOffset, currentOffset), Math.max(initOffset, currentOffset)]
                }
            ]
        }
        const {
            // editarea,
            coparent,
            a_idx,
            b_idx,
            _a, _b,
        } = flattenBoundaryToSameEditArea(initElement, currentElement);

        console.log(coparent)
        // if(coparent.constructor.TYPE === INSTANCE_TYPE.COMPOSITE) {
        //     return [
        //         {   
        //             scope: coparent,
        //             type: INSTANCE_TYPE.COMPOSITE,
        //         }
        //     ]
        // }

        if(coparent.constructor.TYPE === INSTANCE_TYPE.LINE) {
            const i1 = _a[a_idx];
            const i2 = _b[b_idx];
            const init_coparent_idx = coparent.findIndex(i1);
            const curr_coparent_idx = coparent.findIndex(i2);
            const direction = init_coparent_idx < curr_coparent_idx;
            const selections = [];
            if(direction) {
                getSelectionInLine({
                    i1, 
                    init_coparent_idx,
                    initOffset
                }, {
                    i2,
                    curr_coparent_idx,
                    currentOffset
                }, coparent, selections);
            } else {
                getSelectionInLine({
                    i1: i2, 
                    init_coparent_idx: curr_coparent_idx,
                    initOffset: currentOffset
                }, {
                    i2: i1,
                    curr_coparent_idx: init_coparent_idx,
                    currentOffset: initOffset,
                }, coparent, selections);
            }
            return selections;
        }

        if(coparent.constructor.TYPE === INSTANCE_TYPE.EDIT_AREA) {
            const l1 = _a[a_idx];
            const l2 = _b[b_idx];
            const init_coparent_idx = coparent.findIndex(l1);
            const curr_coparent_idx = coparent.findIndex(l2);
            const direction = init_coparent_idx < curr_coparent_idx;
            // const direction = a_idx < b_idx;
            const selections = [];
            if(direction) {
                getSelectionsInEditArea({
                    _a,
                    _a_idx: a_idx,
                    la: l1,
                    init_coparent_idx,
                    initOffset,
                }, {
                    _b,
                    _b_idx: b_idx,
                    lb: l2,
                    curr_coparent_idx,
                    currentOffset
                }, coparent, selections)
            } else {
                getSelectionsInEditArea({
                    _a: _b,
                    _a_idx: b_idx,
                    la: l2,
                    init_coparent_idx: curr_coparent_idx,
                    initOffset: currentOffset,
                }, {
                    _b: _a,
                    _b_idx: a_idx,
                    lb: l1,
                    curr_coparent_idx: init_coparent_idx,
                    currentOffset: initOffset,
                }, coparent, selections)
            }
            
            // if(selections[0].type === 'je-composite') {

            //     const idx = coparent.findIndex(selections[0].scope)
            //     const txt = coparent.getChild(idx-1);
            //     selections.unshift(getSelectionSnippet(txt, txt.getLength()));
            // } 
            // if(selections[selections.length-1].type === 'je-composite') {
            //     const idx = coparent.findIndex(selections[selections.length-1].scope)
            //     const txt = coparent.getChild(idx+1);
            //     selections.unshift(getSelectionSnippet(txt, 0, false));
            // }
            console.log(selections);
            return selections;
        }
        return [];
    }

    _saveBoundary() {
        return [
            {
                path: getPathOfInstance(this.initialBoundary.textElement),
                offset: this.initialBoundary.offset,
            },
            {
                path: getPathOfInstance(this.currentBoundary.textElement),
                offset: this.currentBoundary.offset,
            },
        ]
    }

    restoreBoundary(store) {
        const editareaRoot = this._editor.editareaRoot
        const [a, b] = store;
        this.initialBoundary = {
            textElement: queryInstanceByPath(a.path, editareaRoot),
            offset: a.offset,
        }
        this.currentBoundary = {
            textElement: queryInstanceByPath(b.path, editareaRoot),
            offset: b.offset,
        }
    }

    _delete(batch) {
        const selections = this._selections;     
        const a = selections[0];
        const b = selections[selections.length-1];
        const textA = a.scope;
        const textB = b.scope;
        const [i, j] = a.offset;

        batch.push({
            op: 'range',
            args: this._saveBoundary(),
        });

        // const editline = findParent(textA, INSTANCE_TYPE.LINE);
        // if(!isRedo) {
        //     const undoredo = this._editor.undoredo;
        //     const s = new SelectionDelete({
        //         selections,
        //         editline, 
        //         textElement: textA,
        //         offset: i,

        //         endTextElement: textB,
        //         endOffset: b.offset[1],
        //     }); 
        //     undoredo.write(s)
        //     s.setToPosition(textA, i);
        // }

        if(selections.length === 1) {
            textA.setSource(textA.source.substring(0, i) + a.scope.source.substring(j), batch); 
            return [textA, i];
        }


        const line_a = findParent(textA, INSTANCE_TYPE.LINE);
        const line_b = findParent(textB, INSTANCE_TYPE.LINE);
        const a_idx = line_a.findIndex(textA);
        const b_idx = line_b.findIndex(textB);
        const _a = textA.source.substring(0, i);
        const _b = textB.source.substring(b.offset[1]);

        if(line_a === line_b) {
            textA.setSource(_a + _b, batch);
            line_a.splice(batch, a_idx+1, b_idx-a_idx);
            return [textA, i];
        }

        const edirarea = findParent(textA, INSTANCE_TYPE.EDIT_AREA);
        const line_a_idx = edirarea.findIndex(line_a);
        const line_b_idx = edirarea.findIndex(line_b);
        const alength = line_a.getLength();
        // const remain_a = line_a.slice(0, a_idx + 1);
        const remain_b = line_b.slice(b_idx + 1);
        textA.setSource(_a + _b, batch);
        // const newline = EditLine.create(this._editor);
        // newline.splice(batch, 0, 0, ...remain_a, ...remain_b)
        line_a.splice(batch, a_idx + 1, alength - a_idx, ...remain_b)
        edirarea.splice(batch, line_a_idx+1, line_b_idx - line_a_idx);

        return [textA, i];
    }
} 


function getSelectionSnippet(i, initOffset = 0, direction = true) {
    if(i.constructor.TYPE === INSTANCE_TYPE.COMPOSITE) {
        return {
            scope: i,
            type: INSTANCE_TYPE.COMPOSITE,
        }
    } else {
        return {
            scope: i,
            type: INSTANCE_TYPE.TEXT_ELEMENT,
            offset: direction ? [initOffset, i.getLength()] : [0, initOffset],
        }
    }
}

function getSelectionInLine({
    i1, init_coparent_idx, initOffset
}, {
    i2, curr_coparent_idx, currentOffset
}, coparent, selections) {
    if(i1.constructor.TYPE === INSTANCE_TYPE.COMPOSITE) {
        const preTextElement = coparent.getChild(init_coparent_idx - 1);
        selections.push(getSelectionSnippet(preTextElement, preTextElement.getLength()));
    }
    selections.push(getSelectionSnippet(i1, initOffset, true));
    coparent.forEach((i) => {
        selections.push(getSelectionSnippet(i));
    }, init_coparent_idx + 1, curr_coparent_idx-1);
    selections.push(getSelectionSnippet(i2, currentOffset, false));
    if(i2.constructor.TYPE === INSTANCE_TYPE.COMPOSITE) {
        const afterTextElement = coparent.getChild(curr_coparent_idx + 1);
        selections.push(getSelectionSnippet(afterTextElement, 0));
    }
}

function getSelectionsInEditArea({
    _a, _a_idx, la, init_coparent_idx, initOffset,
  }, {
    _b, _b_idx, lb, curr_coparent_idx, currentOffset
  }, coparent, selections ) {
    const l1_init_ins = _a[_a_idx + 1];
    if(l1_init_ins.constructor.TYPE === INSTANCE_TYPE.COMPOSITE) {
        const line = _a[_a_idx];
        const idx = line.findIndex(l1_init_ins);
        const pretxt = line.getChild(idx - 1);
        selections.push(getSelectionSnippet(pretxt, pretxt.getLength()))
    }
    selections.push(getSelectionSnippet(l1_init_ins, initOffset, true));
    const l1_init_ins_idx = la.findIndex(l1_init_ins) + 1;
    la.forEach((c) => {
        selections.push(getSelectionSnippet(c));
    }, l1_init_ins_idx)

    coparent.forEach((line) => {
        line.forEach((l => {
            selections.push(getSelectionSnippet(l));
        }));
    }, init_coparent_idx + 1, curr_coparent_idx-1);

    const l2_curr_ins = _b[_b_idx + 1];
    const l2_curr_ins_idx = lb.findIndex(l2_curr_ins) - 1;
    lb.forEach((c) => {
        selections.push(getSelectionSnippet(c));
    }, 0, l2_curr_ins_idx);
    selections.push(getSelectionSnippet(l2_curr_ins, currentOffset, false));
    if(l2_curr_ins.constructor.TYPE === INSTANCE_TYPE.COMPOSITE) {
        const line = _b[_b_idx];
        const idx = line.findIndex(l1_init_ins);
        const nexttxt = line.getChild(idx + 1);
        selections.push(getSelectionSnippet(nexttxt, 0, false))
    }
}

export function flattenBoundaryToSameEditArea(initElement, currentElement) {
    // 寻找最近的共同父节点
    const _a = getAncestors(initElement);
    _a.push(initElement);
    const _b = getAncestors(currentElement);
    _b.push(currentElement);
    let i_a, i_b, coparent;
    if(_a.length < _b.length) {
        i_a = _a.length - 1;
        while(i_a >= 0) {
            const instane = _a[i_a];
            i_b = _b.indexOf(instane);
            if(i_b !== -1) {
                coparent = instane;
                break;
            }
            i_a--;
        }

    } else {
        i_b = _b.length - 1;
        while(i_b >= 0) {
            const instane = _b[i_b];
            i_a = _a.indexOf(instane);
            if(i_a !== -1) {
                coparent = instane;
                break;
            }
            i_b--;
        }
    }

    return {
        editarea: findParent(coparent, INSTANCE_TYPE.EDIT_AREA),
        coparent,
        a_idx: i_a+1,
        b_idx: i_b+1,
        _a, _b
        
    }
}

export default Range;