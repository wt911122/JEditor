import { getCaretCoordinates } from '../utils/index'; 
export function createElementElem() {
    const elem = document.createElement('div');
    elem.setAttribute('class', 'jEditor-element');
    elem.setAttribute('contenteditable', true)
    return elem;
}

export function createStructureElem() {
    const elem = document.createElement('div');
    elem.setAttribute('class', 'jEditor-structure');
    elem.setAttribute('contenteditable', false)
    return elem;
}

export function createEditorHTMLElement(wrapper) {
    const element = document.createElement('div');
    // const { width, height } = wrapper.getBoundingClientRect();
    // element.style.width = width + "px";
    // element.style.height = height + "px";
    element.style.cursor = 'text';
    element.setAttribute('contenteditable', true);
    element.setAttribute('class', 'jEditor');
    if(wrapper) {
        wrapper.style.position = 'relative';
        // wrapper.style.overflow = 'hidden';
        wrapper.append(element);
    }
    return element;
}

function createSuggestionHTMLElement(wrapper) {
    const elem = document.createElement('div');
    elem.setAttribute('class', 'jEditor-Suggestion');
    const ul = document.createElement('ul');
    elem.appendChild(ul);
    if(wrapper) {
        wrapper.append(elem);
    }
    return { elem, ul};
}

function createSuggestionHTMLElementLi() {
    const elem = document.createElement('li');
    elem.setAttribute('class', 'jEditor-Suggestion-Item');
    return elem;
}

export class SuggestionElemCtor {
    constructor() {
        this.liElems = [];
        this._active = 0;
        this._show = false;
    }

    bindToWrapper(wrapper) {
        const { elem, ul } = createSuggestionHTMLElement(wrapper);
        this.elem = elem;
        this.ul = ul;
        wrapper.appendChild(this.elem);
        this.wrapper = wrapper;
    }

    replaceItems(items) {
        if(items.length === 0) {
            this.elem.removeAttribute('active');
            this._show = false;
        } else {
            this.elem.setAttribute('active', true);
            this._show = true;
            const ul = this.ul;
            if(this.liElems.length > items.length) {
                this.liElems.length = items.length;
                children = Array.prototype.slice.call(ul.children, 0, items.length);
                ul.replaceChildren(...children);
            }
            this.liElems.forEach((li, idx) => {
                const model = items[idx];
                li.element.innerText = model.value;
                li.model = model;
            });

            
            let i = this.liElems.length;
            items.slice(i, items.length).forEach(i => {
                const lielem = createSuggestionHTMLElementLi();
                lielem.innerText = i.value;
                this.liElems.push({
                    element: lielem,
                    model: i,
                });
                ul.append(lielem);
            });
            const { x, y, height } = getCaretCoordinates();
            const { x: ox, y: oy } =  this.wrapper.getBoundingClientRect();
            this.elem.style.transform = `translate(${x-ox}px, ${y-oy+height}px)`;
        }
        this.active(0);
    }

    active(num) {
        this._active = num;
        const el = this.ul.querySelector('[active]');
        const t = this.ul.children.item(num);
        if(el) {
            el.removeAttribute('active');
        }
        if(t) {
            t.setAttribute('active', true);
        }
    }

    up() {
        const len = this.liElems.length;
        let n = this._active - 1;
        n  = (n < 0 ? len + n : n) % len;
        this.active(n);
    }

    down() {
        const len = this.liElems.length;
        const n = (this._active + 1) % len;
        this.active(n);
    }

    isActive() {
        return this._show;
    }

    clean() {
        this.ul.innerHTML = '';
    }

    select() {
        if(this.isActive) {
            const model = this.liElems[this._active].model;
            if(model.handler){
                return model.handler();
            }
            return undefined
        }
    }
}
