import {
    createCanvas,
    listenOnDevicePixelRatio, 
    cacheCanvasCtx,
} from "./dom-utils/canvas"
import { createInputElement } from './dom-utils/input';
import ScrollBarManager from './components/scrollbar';
import Editor from './model/editor';
import Configration, { resolveConfigration } from './model/configration';

class JEditor extends EventTarget{
    constructor(configs) {
        super();  
        resolveConfigration(configs);
        this.editorModel = new Editor(configs)
    }

    $mount(dom) {
        const {
            canvas,
            ctx,
            width,
            height,
            raw_width,
            raw_height,
        } = createCanvas(dom);
        this.wrapperElem = dom;
        this.canvas = canvas;
        this.canvasMeta = {
            width: raw_width,
            height: raw_height,
            actual_width: width,
            actual_height: height,
        }
        this.ctx = ctx;
        this.dpr = window.devicePixelRatio;
        this.reflow();

        this.position = [0, 0];
        this._cacheViewBox();

        this.initListeners();
        this.scrollbarMng = new ScrollBarManager({});
        this.scrollbarMng.bind(this, (offset) => {
            this.panHandler(...offset);
        });

        listenOnDevicePixelRatio((dpr) => {
            this.dpr = dpr;
            this.scheduleRender();
        })

        this.__clock__ = undefined;
        this.scheduleRender();
    }

    initListeners() {
        const canvas = this.canvas;
        const inputElement = createInputElement(this._controlCallback.bind(this));
        this.wrapperElem.append(inputElement);
        
        canvas.addEventListener('click', (event) => {
            inputElement.focus();  
            const point = [event.offsetX, event.offsetY];
            this.editorModel.startEdit(this.scheduleRender.bind(this), point);  
            console.log('startEdit', this.editorModel.cursor)
        });
        inputElement.addEventListener('blur', () => {
            console.log('stopEdit')
            this.editorModel.stopEdit();
        })

        canvas.addEventListener('wheel', (event) => {
            // TODO 上下左右滚动
            event.preventDefault();
            event.stopPropagation();
            let { deltaX, deltaY } = event
            this.panHandler(-deltaX, -deltaY);
        });

        this.addEventListener('pan', () => {
            this._cacheViewBox();
        })
    }

    panHandler(deltaX, deltaY) {
        if(this._panning) return;
        
        this._panning = true;
        this._recalculatePosition(deltaX, deltaY);
        this.dispatchEvent(new CustomEvent('pan', {
            detail: {
                deltaX, deltaY,
            }
        }))
        
        this.scheduleRender(() => {
            this._panning = false;
        });
    }

    reflow() {
        this.editorModel.reflow();
    }

    _controlCallback(op, data) {
        switch(op){
            case "Input":
            case "compositionstart":
            case "compositionupdate":
            case "compositionend":
            case "Enter":
            case "Backspace":
                this.editorModel.onInput(op, data);
                this.reflow();
                this.scheduleRender();
                break;
            // case "ArrowLeft":
            //     this._onArrowLeft();
            //     break;
            // case "ArrowRight":
            //     this._onArrowRight();
            //     break;
            // case "ArrowDown":
            //     this._onArrowDown();
            //     break;
            // case "ArrowUp":
            //     this._onArrowUp();
            //     break;
            default:
                break;
        }
    }

    _cacheViewBox() {
        this._cacheViewBox = [
            ...this._clientOffsetToCoord([0,0]),
            ...this._clientOffsetToCoord([
                this.canvasMeta.actual_width, 
                this.canvasMeta.actual_height
            ]),
        ];
    }

    _clientOffsetToCoord(p) {
        const [x, y] = this.position;
        return [p[0] - x, p[1] - y];
    }

    _recalculatePosition(deltaX, deltaY) {
        const { width: editorWidth, height: editorHeight } = this.editorModel;
        const { actual_width: width, actual_height: height } = this.canvasMeta;
        this.position[0] = Math.max(Math.min(this.position[0] + deltaX, 0), -Math.max(0, editorWidth - width));
        this.position[1] = Math.max(Math.min(this.position[1] + deltaY, 0), -Math.max(0, editorHeight - height));
    }

    _setTransform() {
        const { width, height } = this.canvasMeta;
        const ctx = this.ctx;
        ctx.setTransform();
        ctx.clearRect(0, 0, width, height);
        ctx.scale(this.dpr, this.dpr);
        ctx.translate(...this.position);
    }

    __render() {
        this._setTransform();
        const ctx = this.ctx;
        ctx.font = `${Configration.font.fontSize}px ${Configration.font.fontFamily}`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        this.editorModel.render(ctx);
        this.scrollbarMng.renderScrollBar(ctx);
    }

    scheduleRender(callback) {
        requestAnimationFrame((timestamp) => {
            const isFirstTime = this.__clock__ !== timestamp
            if(isFirstTime) {
                this.__render();
            }
            if(callback) {
                callback(timestamp);
            }
            this.__clock__ = timestamp;
        })
    }
}

export default JEditor;

export { default as TextElement} from './elements/textElement';