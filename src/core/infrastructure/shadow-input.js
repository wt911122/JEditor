import { makeElement } from '../components/dom';
import { JEDITOR_EVENTS, KEYBOARD_COMMANDS, KEYBOARD_INPUT } from '../constants';
class ShadowInput extends EventTarget{
    static create() {
        const inputElem = makeElement({
            tag: 'input',
            className: ['jeditor-hidden-input'],
            attributes: {
                tabindex: -1,
                spellcheck: false,
                autocorrect: 'off',
            },
        });
        const elem = makeElement({
            tag: 'div',
            className: ['jeditor-hidden-input-wrapper'],
            attributes: {
                'aria-hidden': true,
            },
            childNodes: [
                inputElem
            ]
        });

        const input = new ShadowInput();
        input.attach(elem, inputElem);
        return input;
    }

    documentElement = null;
    inputElem = null;
    
    controlCallback(kind, data) {
        switch(kind) {
            case KEYBOARD_INPUT.INPUT:
            case KEYBOARD_INPUT.COMPOSITION_START:
            case KEYBOARD_INPUT.COMPOSITION_UPDATE:
            case KEYBOARD_INPUT.COMPOSITION_END:
                this.dispatchEvent(new CustomEvent(JEDITOR_EVENTS.INPUT, {
                    detail: {
                        kind,
                        data,
                    }
                }))
            break;

            case KEYBOARD_COMMANDS.ARROW_LEFT:
            case KEYBOARD_COMMANDS.ARROW_RIGHT:
            case KEYBOARD_COMMANDS.ARROW_UP:
            case KEYBOARD_COMMANDS.ARROW_DOWN:
            case KEYBOARD_COMMANDS.RETURN:
            case KEYBOARD_COMMANDS.DELTET:
            case KEYBOARD_COMMANDS.UNDO:
            case KEYBOARD_COMMANDS.REDO:
                this.dispatchEvent(new CustomEvent(JEDITOR_EVENTS.CONTROL_CMD, {
                    detail: {
                        kind,
                    }
                }))
            break;

        }
    }

    startEdit() {
        this.inputElem.focus({preventScroll: true});
    }

    attach(inputwrapper, inputElem) {
        this.documentElement = inputwrapper;
        this.inputElem = inputElem;
        const input = inputElem;
        let stopInput = false;
        let status = {
            ctrlOn: false,
            shiftOn: false,
        }
        const controlCallback = this.controlCallback.bind(this);

        input.addEventListener('beforeinput', e => {
            console.log(e.inputType)
            e.preventDefault();
            // console.log(e.inputType)
            if(e.data) {
                if(!stopInput) {
                    controlCallback(KEYBOARD_INPUT.INPUT, e.data);
                }
            }
        });
        input.addEventListener('input', e => {
            console.log(e.inputType)
        });

        input.addEventListener('compositionstart', (e) => {
            controlCallback(KEYBOARD_INPUT.COMPOSITION_START);
            stopInput = true;
        });
        input.addEventListener('compositionupdate', (e) => {
            controlCallback(KEYBOARD_INPUT.COMPOSITION_UPDATE, e.data);
        });
        input.addEventListener('compositionend', (e) => {
            controlCallback(KEYBOARD_INPUT.COMPOSITION_END, e.data);
            input.value = '';
            stopInput = false
        });

        input.addEventListener('keyup', (event) => {
            switch(event.key) {
                case "Shift":
                    controlCallback("Shift", false);
                    status.shiftOn = false;
                    break;
                case "Meta":
                case "Control":
                    status.ctrlOn = false;
                    break;
                
            }
        })

        input.addEventListener('keydown', (event) => {
            switch(event.code) {
                case "Enter":
                    controlCallback(KEYBOARD_COMMANDS.RETURN);
                    break;
                case "Backspace":
                    controlCallback(KEYBOARD_COMMANDS.DELTET);
                    break;
                case "ArrowLeft":
                    controlCallback(KEYBOARD_COMMANDS.ARROW_LEFT);
                    break;
                case "ArrowRight":
                    controlCallback(KEYBOARD_COMMANDS.ARROW_RIGHT);
                    break;
                case "ArrowDown":
                    controlCallback(KEYBOARD_COMMANDS.ARROW_DOWN);
                    break;
                case "ArrowUp":
                    controlCallback(KEYBOARD_COMMANDS.ARROW_UP);
                    break;
            }
            switch(event.key) {
                case "Shift":
                    controlCallback("Shift", true);
                    status.shiftOn = true;
                    break;
                case "Meta":
                case "Control":
                    status.ctrlOn = true;
                    break;
                case 'a':
                    if(status.ctrlOn) {
                        controlCallback('CtrlA');
                    }
                    break;
                case 'c':
                    if(status.ctrlOn) {
                        controlCallback('CtrlC');
                    }
                    break; 
                case 'v':
                    if(status.ctrlOn) {
                        controlCallback('CtrlV');
                    }
                    break;   
                case 'x':
                    if(status.ctrlOn) {
                        controlCallback('CtrlX');
                    }
                    break;
                case 'y':
                    if(status.ctrlOn) {
                        event.preventDefault();
                        controlCallback(KEYBOARD_COMMANDS.REDO);
                    }
                    break;
                case 'z':
                    if((status.ctrlOn && status.shiftOn)) {
                        controlCallback(KEYBOARD_COMMANDS.REDO);
                    } else if(status.ctrlOn) {
                        controlCallback(KEYBOARD_COMMANDS.UNDO);
                    }
                    break;
            }
        })
    }
    setPosition(x, y) {
        this.documentElement.style.transform = `translate(${x}px, ${y}px)`;
    }
}

export default ShadowInput;