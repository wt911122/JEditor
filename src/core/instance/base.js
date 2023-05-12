import { JEDITOR_SYMBOL } from '../constants';

class Base {
    documentElement = null
    // _parent = null
    _editor = null

    attach(element) {
        this.documentElement = element;
        element[JEDITOR_SYMBOL] = this;
    }
    insert() {}

    getChildren() {
        return []
    }
}


export default Base;

export function _insert(
    instanceElement, 
    instance_stack, 
    idx, 
    target,
    wrapper,
) {
    let nextElem;
    if(idx !== undefined) {
        nextElem = instance_stack[idx]?.documentElement;
    }
    if(!nextElem) {
        idx = instance_stack.length;
    }
    instance_stack.splice(idx, 0, target);
    // target._parent = this;
    let _el = target.documentElement;
    if(wrapper) {
        _el = wrapper(idx, _el);
    }
    if(!nextElem) {
        instanceElement.append(_el);
    } else {
        instanceElement.insertBefore(_el, nextElem)
    }
}

export function _findIndex(list, child) {
    return list.findIndex(n => n === child);
}

export function _getChild(list, idx) {
    return list[idx];
}

export function _getLastChild(list) {
    return list[list.length-1];
}


export function _splice(
    instance_stack, 
    instanceElement, 
    start, deleteCount, ...items
) {
    const nexElem = instance_stack[start+deleteCount];
    const removed_instances = instance_stack.splice(start, deleteCount, ...items);
    removed_instances.forEach(i => {
        i.documentElement.remove();
    });
    
    if(nexElem) {
        items.forEach((i) => {
            instanceElement.insertBefore(i.documentElement, nexElem.documentElement);
        })
    } else {
        items.forEach((i) => {
            instanceElement.append(i.documentElement);
        })
    }
    return removed_instances;
}

export function _forEach(
    instance_stack,
    callback,
    start, end,
) {
    if(end === undefined) {
        end = instance_stack.length;
    }
    while(start >= 0 && start <= end && instance_stack[start]) {
        callback(instance_stack[start])
        start++;
    }
}