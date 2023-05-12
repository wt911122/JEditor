import {
    JEDITOR_SYMBOL,
    JEDITOR_CONTAINER,
    JEDITOR_CONTENT,
    TOKEN,
    INSTANCE_TYPE,
} from './constants';
import { makeElement } from './components/dom';

export function findParent(instance, selector) {
    if(instance.constructor.TYPE === selector) {
        return instance;
    }
    const element = instance.documentElement.closest(selector);
    return element?.[JEDITOR_SYMBOL];
} 

export function queryChildren(instance, selector) {
    if(instance.constructor.TYPE === selector) {
        return instance;
    }
    const element = instance.documentElement;
    const elements = element.querySelectorAll(selector);
    return Array.prototype.map.call(elements, elem => ({
        instane: elem?.[JEDITOR_SYMBOL],
        documentElement: elem,
    }));
} 

export function findPreviousSibling(instance) {
    const element = instance.documentElement.previousSibling;
    return element?.[JEDITOR_SYMBOL];
} 

export function findNextSibling(instance) {
    const element = instance.documentElement.nextSibling;
    return element?.[JEDITOR_SYMBOL];
} 

function traverseUp(instance, callback) {
    const topTag = JEDITOR_CONTENT.toUpperCase();
    let elem = instance.documentElement.parentNode;
    while(elem.tagName !== topTag) {
        if(elem?.[JEDITOR_SYMBOL]) {
            if(callback(elem?.[JEDITOR_SYMBOL])){
                return;
            }
        }
        elem = elem.parentNode;
    }
}

export function getAncestors(instance) {
    let ancestors = [];
    traverseUp(instance, (i) => {
        ancestors.unshift(i);
    })
    return ancestors;
}
export function findFirstCommonParentNode(instance_a, instance_b) {
    const _a = getAncestors(instance_a);
    _a.push(instance_a);
    if(_a.includes(instance_b)) {
        return instance_b;
    }
    let target;
    traverseUp(elementB, (i) => {
        if(_a.includes(i)) {
            target = i;
            return true;
        }
    });
    return target;
}


export function findElementWithRelativeCondition({
    targetElements: arr, 
    start, 
    factor, 
    condition, 
    filter
}) {
    let t = start;
    let target;
    if(filter) {
        arr = arr.filter(filter);
    }
    arr.forEach((item) => {
        const q = factor(item);
        if(!t || condition(q, t)) {
            target = item;
            t = q;
        }
    })
    return target
}

export function getBoundingBoxCenterY(box) {
    return (box.bottom - box.top) / 2 + box.top
}


export function getEditor(instance) {
    const container = instance.documentElement.closest(JEDITOR_CONTAINER);
    return container[JEDITOR_SYMBOL];
}


export function tokenToHTML(tokens) {
    const newElements = [];
    tokens.forEach(token => {
        switch(token.kind) {
            case TOKEN.TEXT:
                newElements.push(token.content.replace(/\s/g, '&nbsp;'));
                break;
            default:
                newElements.push(`<span class="${token.kind}">${token.content}</span>`);
        }
    });
    console.log(newElements)
    return newElements;
}


export function DepthFirstLoopMeta(root, callback) {
    let queue = [root]
    while (queue.length !== 0) {
        const node = queue.shift();
        if(callback(node)) { return }
        queue = node.getChildren().concat(queue);
    }
}

export function DepthLastLoopMeta(root, callback) {
    let queue = [root]
    while (queue.length !== 0) {
        const node = queue.pop();
        if(callback(node)) { return }
        queue = queue.concat(node.getChildren());
    }
}

const HAN_REGEXP = /[^\x00-\xff]/;
export function calculateTextWidth(source, begin, end, monospace, monospacedouble) {
    const text = source.substring(begin, end);
    let s = 0;
    for (var i = 0; i < text.length; i++) {
        const char = text.charAt(i);
        s += HAN_REGEXP.test(char) ? monospacedouble : monospace;
    }
    return s;
}

export function calculateTextOffset(source, width, monospace, monospacedouble) {
    let s = 0;
    let offset = 0;
    let lastspace;
    while(s < width && offset < source.length) {
        const char = source.charAt(offset);
        lastspace = (HAN_REGEXP.test(char) ? monospacedouble : monospace) 
        s += lastspace;
        offset++;
    }
    if(s - width > lastspace/2){
        offset--;
    }
    return offset;
}
export function calculateTextSelectionInRange(source, begin, end, monospace, monospacedouble) {
    let i = 0;
    let w = 0;
    let ox = 0;
    while(i < source.length && i < end) {
        const char = source.charAt(i);
        const _w = (HAN_REGEXP.test(char) ? monospacedouble : monospace);
        if(i < begin) {
            ox += _w;
        } else {
            w += _w
        }
        i++;
    }
    return [ox, w];
}


export function targetLockOn(targetElem, clientX, clientY, context, editor) {
    const C_TAGNAME = JEDITOR_CONTENT.toUpperCase();
    const Composite_Tag = INSTANCE_TYPE.COMPOSITE.toUpperCase();
    const Text_Tag = INSTANCE_TYPE.TEXT_ELEMENT.toUpperCase();
    const Line_Tag = INSTANCE_TYPE.LINE.toUpperCase();

    let type;
    while(targetElem && targetElem.tagName !== C_TAGNAME) {
        if(targetElem.tagName === Composite_Tag) {
            type = INSTANCE_TYPE.COMPOSITE;
            break;
        }
        if(targetElem.tagName === Text_Tag) {
            type = INSTANCE_TYPE.TEXT_ELEMENT;
            break;
        }
        if(targetElem.tagName === Line_Tag) {
            type = INSTANCE_TYPE.LINE;
            break;
        }
        targetElem = targetElem.parentNode;
    }

    if(targetElem && targetElem.tagName === C_TAGNAME) {
        const editareaElem = targetElem.children[0];
        let elem;
        for (const child of editareaElem.children) {
            const box = child.getBoundingClientRect();
            if(box.y < clientY && box.bottom > clientY) {
                elem = child;
                break;
            }
        }
        const instance = elem[JEDITOR_SYMBOL];
        let i;
        DepthLastLoopMeta(instance, node => {
            if(node.constructor.TYPE === INSTANCE_TYPE.TEXT_ELEMENT) {
                i = node;
                return true;
            }
        });
        return {
            textElement: i,
            offset: i.getLength(),
        }
    }
    if(type === INSTANCE_TYPE.TEXT_ELEMENT) {
        const x = targetElem.getBoundingClientRect().x;
        const instance = targetElem[JEDITOR_SYMBOL]
        const offset = calculateTextOffset(instance.source, clientX - x, context.monospace, context.monospacedouble);
        // const p = getPathOfInstance(instance);
        // console.log(p)
        // console.log(queryInstanceByPath(p, editor.editareaRoot))
        return {
            textElement: instance,
            offset,
        }
    }
    if(type === INSTANCE_TYPE.LINE) {
        const instance = targetElem[JEDITOR_SYMBOL];
        const textElement = instance.getChild(instance.getLength()-1)
        return {
            textElement,
            offset: textElement.getLength(),
        }
    }
    if(type === INSTANCE_TYPE.COMPOSITE) {
        const instance = targetElem[JEDITOR_SYMBOL];
        const bound = targetElem.getBoundingClientRect();
        if(clientX - bound.x < bound.width/2) {
            const textElement = findPreviousSibling(instance);
            return {
                textElement,
                offset: textElement.getLength(),
            }
        } else {
            const textElement = findNextSibling(instance);
            return {
                textElement,
                offset: 0,
            }
        }
    }

    return null;
}

export function getPathOfInstance(instance) {
    let path = [];
    let lastInstance = instance;
    traverseUp(instance, (i) => {
        const idx = i.findIndex(lastInstance);
        path.unshift(idx);
        lastInstance = i;
    });

    return path;
}

export function queryInstanceByPath(path, root) {
    let i = root;
    let p = path.slice();
    while(p.length) {
        i = i.getChild(p.shift());
    }
    return i;
}