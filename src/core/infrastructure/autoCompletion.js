import { JEDITOR_AUTO_COMPLETION } from '../constants';
import { makeElement } from '../components/dom'

function createSuggestionHTMLElementLi() {
    return makeElement({
        tag: 'li',
        className: ['jEditor-Suggestion-Item'],
    })
}

class AutoCompletion {
    static create(editor) {
        const elem = makeElement({
            tag: JEDITOR_AUTO_COMPLETION,
            className: ['jeditor-autocompletion'],
        });
        const autocompletion = new AutoCompletion();
        autocompletion._editor = editor;
        autocompletion.attach(elem)
        return autocompletion;
    }

    attach(elem) {
        this.documentElement = elem;
        this.ul = makeElement({ tag: 'ul' });
        this.documentElement.append(this.ul);
    }

    _active = 0;
    _show = false;
    liElems = [];
    
    replaceItems(completions) {
        if(completions.length === 0) {
            this.documentElement.removeAttribute('active');
            this._show = false;
        } else {
            this.documentElement.setAttribute('active', true);
            this._show = true;
            const ul = this.ul;
            if(this.liElems.length > completions.length) {
                this.liElems.length = completions.length;
                ul.replaceChildren(...Array.prototype.slice.call(ul.children, 0, completions.length));
            }
            this.liElems.forEach((li, idx) => {
                const completion = completions[idx];
                li.element.innerText = completion.title;
                li.completion = completion;
            });

            
            let i = this.liElems.length;
            completions.slice(i, completions.length).forEach(completion => {
                const lielem = createSuggestionHTMLElementLi();
                lielem.innerText = completion.title;
                this.liElems.push({
                    element: lielem,
                    completion,
                });
                ul.append(lielem);
            });
            const caretElem = this._editor.caret.documentElement;
            const boxContainer = this._editor.getContainerInnerBoundingClientRect();
            const { x: cx, y: cy, height: ch } = caretElem.getBoundingClientRect();
            this.documentElement.style.transform = `translate(${cx - boxContainer.x}px, ${cy - boxContainer.y + ch}px)`;

            // const { x, y, height } = getCaretCoordinates();
            // const { x: ox, y: oy } =  this.wrapper.getBoundingClientRect();
            // this.elem.style.transform = `translate(${x-ox}px, ${y-oy+height}px)`;
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

    get isActive() {
        return this._show;
    }

    clean() {
        this.ul.innerHTML = '';
    }

    select() {
        if(this.isActive) {
            const completion = this.liElems[this._active].completion;
            return completion
        }
    }

}

export default AutoCompletion;