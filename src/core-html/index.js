import { 
    createEditorHTMLElement,
} from './components/index';
import Editor from './model/editor';
import { 
    findElementOrStructure, 
    getCaretPosition,
    getModelFromNode,
    findEditorElement,
    findElementOnCaret
} from './utils/index';
import { Configration } from './configrations';

class JEditor extends EventTarget{
    constructor(configs) {
        super();
        this.editorModel = new Editor(configs);
    }

    static registLanguage(name, lang) {
        Configration.registLanguage(name, lang);
    }

    $mount(dom) {
        const domElement = createEditorHTMLElement(dom);
        this._initEventListeners(domElement)
        
        this.editorModel.render(domElement, dom);
        
    }

    _initEventListeners(domElement) {
        let stopInput = false;
        domElement.addEventListener('beforeinput', e => {
            e.preventDefault();
            if(!stopInput && e.data) {
                this._controlCallback('Input', e.data);
            }
        })
        domElement.addEventListener("keydown", (e) => {
            if(stopInput) {
                e.preventDefault();
            }
            switch(e.code) {
                case "Backspace":
                    this._controlCallback('Backspace');
                    break;
                case "ArrowUp":
                case "ArrowDown":
                case "Enter":
                    this.editorModel.onSelect(e.code, e);
                    break
            }
            console.log(e.key, e.code);
        });

        domElement.addEventListener("keyup", (e) => {
            switch(e.code) {
                case "ArrowLeft":
                case "ArrowRight":
                case "Tab":
                    const elem = findElementOnCaret(domElement);
                    this.editorModel.focus(getModelFromNode(elem));
                break;
            }
        });
        domElement.addEventListener('compositionstart', (e) => {
            e.preventDefault();
            this._controlCallback('compositionstart');
            stopInput = true;
        });
        domElement.addEventListener('compositionupdate', (e) => {
            e.preventDefault();
        });
        domElement.addEventListener('compositionend', (e) => {
            e.preventDefault();
            this._controlCallback('compositionend', e.data);
            stopInput = false
            console.log('compositionend', e.data);
        });

        domElement.addEventListener('pointerup', (e) => {
            const elem = findElementOnCaret(domElement);
            this.editorModel.closeSuggestion();
            this.editorModel.focus(getModelFromNode(elem));
        })

        domElement.addEventListener('focusout', e => {
            this.editorModel.closeSuggestion();
        })
    }

    _controlCallback(op, data) {
        switch(op){
            case "Input":
            case "compositionstart":
            case "compositionupdate":
            case "compositionend":
            // case "Enter":
            case "Backspace":
                this.editorModel.onInput(op, data);
                break;
            // case "ArrowLeft":
            //     break;
            // case "ArrowRight":
            //     break;
            default:
                break;
        }
    }
}

export default JEditor;

export { JEditorElement } from './elements/element';
export { JEditorStructure } from './elements/structure';
export { JEditorToken } from './model/token';