import { JEDITOR_MODEL_REF } from '../constants';
import { JEditorElement } from '../elements/element';
import { JEditorStructure } from '../elements/structure';

export function findElementOrStructure(elem, topElem) {
    while(elem !== topElem) {
        if(elem[JEDITOR_MODEL_REF]) {
            return elem;
        }
        elem = elem.parentElement;
    }
    return null;
}

export function findEditorElement(elem, topElem) {
    const struts = getModelFromNode(findElementOrStructure(elem, topElem));
    let _elem = struts;
    if(struts instanceof JEditorStructure) {
        struts.traverseFirstOrder((el) => {
            _elem = el 
            return false;
        }, (elem) => elem instanceof JEditorElement)
    }
    return _elem;
}

export function getModelFromNode(elem) {
    return elem[JEDITOR_MODEL_REF];
}

export function setCaret(node, offset) {
    var range = document.createRange()
    var sel = window.getSelection()
    
    range.setStart(node, offset)
    range.collapse(true)
    
    sel.removeAllRanges()
    sel.addRange(range)
}

export function findElementOnCaret(topElem) {
    const selectedObj = window.getSelection();
    console.log(selectedObj)
    const anchorNode = selectedObj.anchorNode;
    return findElementOrStructure(anchorNode, topElem)
}

export function getCaretPosition(editorElement) {
    const selectedObj = window.getSelection();
    const anchorNode = selectedObj.anchorNode;
    const anchorOffset = selectedObj.anchorOffset;
    const offset = editorElement._tokenMap.get(anchorNode)?.offset || 0;
    return offset + anchorOffset;
}

export function getCaretToken(editorElement) {
    const selectedObj = window.getSelection();
    const anchorNode = selectedObj.anchorNode;
    return editorElement._tokenMap.get(anchorNode)?.token
}

export function getCaretCoordinates() {
    let x = 0,
        y = 0,
        height = 0;
    const isSupported = typeof window.getSelection !== "undefined";
    if (isSupported) {
        const selection = window.getSelection();
        if (selection.rangeCount !== 0) {
            const range = selection.getRangeAt(0).cloneRange();
            range.collapse(true);
            const rect = range.getClientRects()[0];
            if (rect) {
                x = rect.left;
                y = rect.top;
                height = rect.height;
            }
        }
    }
    return { x, y, height };
}

export function escape(text) {
    if(/^\s+$/.test(text)) {
        return new Array(text.length).fill('\u00A0').join('');
    }
    return text;
}

export function renderToken(tokens) {
    const tokenMap = new WeakMap();
    let offset = 0;
    return {
        tokenMap,
        template: tokens.map(tk => {
            let txtNode;
            let node;
            txtNode = document.createTextNode(escape(tk.text));
            tokenMap.set(txtNode, { 
                offset, token: tk,
            });
            if(tk.kind)  {
                node = document.createElement('span');
                node.setAttribute('class', `jEditor-token jEditor-${tk.kind}`);
                node.append(txtNode);
            }
            offset += tk.text.length;
            return node || txtNode;
        }),
    }
}

export const STRUCTURE_SYMBOL = Symbol('structure');

// export function getCaretPosition(editorElement) {
//     if (window.getSelection && window.getSelection().getRangeAt) {
//         const range = window.getSelection().getRangeAt(0);
//         const selectedObj = window.getSelection();
//         const anchorNode = selectedObj.anchorNode;
//         const element = editorElement.domElement;
//         const childNodes = element.childNodes;
//         let offset = 0;
//         for (var i = 0; i < childNodes.length; i++) {
//             if (childNodes[i] == anchorNode || childNodes[i].contains(anchorNode)) {
//                 break;
//             }
//             offset += childNodes[i].textContent.length;
//         }
//         return {
//             offset: range.startOffset + offset
//         };
//     }

//     return null;
// } 



/* export function getCaretPosition() {
    if (window.getSelection && window.getSelection().getRangeAt) {
        var range = window.getSelection().getRangeAt(0);
        var selectedObj = window.getSelection();
        var rangeCount = 0;
        var childNodes = selectedObj.anchorNode.parentNode.childNodes;
        for (var i = 0; i < childNodes.length; i++) {
            if (childNodes[i] == selectedObj.anchorNode) {
                break;
            }
            if (childNodes[i].outerHTML)
                rangeCount += childNodes[i].outerHTML.length;
            else if (childNodes[i].nodeType == 3) {
                rangeCount += childNodes[i].textContent.length;
            }
        }
        return {
            node: selectedObj.anchorNode,
            offset: range.startOffset + rangeCount
        };
    }
    return null;
} */

