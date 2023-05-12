import { JEDITOR_EVENTS, INSTANCE_TYPE } from '../constants';
import { makeElement } from '../components/dom'; 
import { findParent, calculateTextWidth } from '../utils';

class Caret {
    static create(editor) {
        const elem = makeElement({
            tag: 'span',
            className: ['jeditor-caret'],
            textContent: 'B'
        });
        const caret = new Caret();
        caret._editor = editor;
        caret.attach(elem)
        return caret;
    }

    status = {
        _ensureDeleteComposite: null,
        textElement: null,
        offset: 0,
    }
    documentElement = null;
    _editor = null;
    _animate = null;

    attach(elem) {
        this.documentElement = elem;
        const _animate = {
            timer: null,
            run() {
                _animate.timer = Date.now();
                function start() {
                    requestAnimationFrame(() => {
                        const now = Date.now();
                        if(_animate.timer) {
                            if(now - _animate.timer > 500) {
                                _animate.timer = now;
                                elem.style.opacity = elem.style.opacity === '1' ? '0' : '1';
                            }
                            requestAnimationFrame(start);
                        }
                    })
                }
                start();
            },
            stop() {
                _animate.timer = null;
            },
            refresh() {
                _animate.timer = Date.now();
                elem.style.opacity = 1;
            }
        }
        this._animate = _animate;
        this._animate.run()
    }

    forward(offset) {
        this.status.offset += offset;
        this.update();
    }

    setOffset(offset) {
        this.status.offset = offset;
        this.update();
    }

    setEnsureDeleteComposite(composite) {
        this.status._ensureDeleteComposite = composite;
        composite.ensureDelete();
    }

    focus(textElement, offset = 0) {
        this._resolveFocus(textElement);
        Object.assign(this.status, {
            textElement,
            offset,
            _ensureDeleteComposite: null,
        });
        this.update();
        this._editor.shadowInput.startEdit();
    }

    _resolveFocus(textElement) {
        const old_textElement = this.status.textElement;
        if(old_textElement && old_textElement !== textElement) {
            const now_area = findParent(textElement, INSTANCE_TYPE.EDIT_AREA);
            const old_editArea = findParent(old_textElement, INSTANCE_TYPE.EDIT_AREA);
            if(old_editArea && old_editArea !== now_area) {
                old_editArea.blur();
            }
            now_area.focus();

            const now_composite = findParent(textElement, INSTANCE_TYPE.COMPOSITE);
            const old_composite = findParent(old_textElement, INSTANCE_TYPE.COMPOSITE);
            if(old_composite && old_composite !== now_composite) {
                old_composite.blur();
            }
            if(now_composite) {
                now_composite.focus();
            }
        }

        if(this.status._ensureDeleteComposite) {
            this.status._ensureDeleteComposite.preventDelete();
        }
    }

    update() {
        const {
            textElement,
            offset
        } = this.status;
        const elem = textElement.documentElement;
        
        const { monospace, monospacedouble } = this._editor.getEditorContext();
        const fontSize = window.getComputedStyle(elem).fontSize;
        const textWidth = calculateTextWidth(textElement.source, 0, offset, monospace, monospacedouble);

        const { x, y } = elem.getBoundingClientRect();
        const boxContent = this._editor.getContentBoundingClientRect();
        const boxContainer = this._editor.getContainerInnerBoundingClientRect();
        let tx = x - boxContent.x + textWidth;
        let ty = y - boxContent.y;
        console.log(y, boxContent.y, ty)
        const ox = boxContainer.x - boxContent.x;
        console.log(tx-ox, boxContainer.width)
        if(tx - ox > boxContainer.width) {
            this._editor.scrollContent(tx - boxContainer.width + 2, 0);
        }
        if(tx - ox < 0) {
            this._editor.scrollContent(tx, 0);
        }
        this.documentElement.style.transform = `translate(${tx}px, ${ty}px)`;
        this.documentElement.style.fontSize = fontSize;
        this._animate.refresh();
    }
}

export default Caret;