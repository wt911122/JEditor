// element 与 结构 mapping
// 一个结构可能对应多个 element
function getMapObject() {
    return {
        structureNode: undefined,
        elements: [],
    }
}
class ElemNodeToStuctureWeakMap {
    constructor() {
        this._map = new WeakMap();
    }

    get(source) {
        return this._map.get(source);
    }

    set(source) {
        const obj = getMapObject();
        this._map.set(source, obj);
        return obj;
    }

    has(source) {
        return this._map.has(source);
    }

    delete(source) {
        this._map.delete(source);
    }

    clear() {
        this._map.clear();
    }
}

