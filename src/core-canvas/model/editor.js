import Structure, { calculateUpToTopCoord } from '../elements/structure';
import Cursor from '../components/cursor';
import Language from './language';
import Configration from './configration';
import TextElement from '../elements/textElement';
import {
    getListTail,
    getElementIndexInList
} from '../utils';

class Editor extends Structure {
    constructor(configs) {
        super();
        this.cursor = new Cursor();
        const source = configs.source
        this.language = new Language(configs.lang);

        this.elements = this.language.resolve(source);
        this.cursor.set({
            element: [0],
            offset: this.elements[0].headOffset,
        });

        this._editStatus = {
            editting: false,
            cursorFlash: false, 
            lastElapsed: Date.now(),
        }
        this._cursorAnime = null;
       
        // for composition input
        this._cacheIdx = null;
    }

    startEdit(renderFn, point) {
        if(!this._editStatus.editting) {
            this._editStatus.editting = true;
            // this.refreshCursor();
            this.startCursorAnime(renderFn);
        } 
        this._jumpCursorWithCoord(point);

    }

    stopEdit() {
        this._editStatus.editting = false;
        if(this._cancelCursorAnime) {
            this._cancelCursorAnime();
        }
    }

    startCursorAnime(renderFn) {
        let flag = true;
        const _runAnime = () => {
            const elapsed = Date.now();
            const lastElapsed = this._editStatus.lastElapsed;
            if(elapsed - lastElapsed > 500) {
                this._editStatus.cursorFlash = !this._editStatus.cursorFlash;
                this._editStatus.lastElapsed = elapsed;
                renderFn();
            } 
            if(flag) {
                requestAnimationFrame(_runAnime);
            }
        }
        requestAnimationFrame(_runAnime);

        this._cancelCursorAnime = function() {
            flag = false;
        }
    }

    onInput(op, data) {
        const _currElement = this._currElement();
        const offset = this.cursor.offset;
        const source = _currElement.source;

        let preContent = source.substring(0, offset);
        let afterContent 
        if(this._cacheIdx) {
            afterContent = source.substring(this._cacheIdx[1]);
        } else {
            afterContent = source.substring(offset);
        }
        switch(op){
            case "Input":
                preContent += data;
                this.cursor.move(data.length)
                _currElement.changeSource(preContent + afterContent);
                break;
            case "compositionstart":
                this.cacheIdx = [preContent.length, preContent.length];
                break;
            case "compositionupdate":
                preContent = preContent.substring(0, this.cacheIdx[0]);
                preContent += data;
                _currElement.changeSource(preContent + afterContent);
                this.cursor.move(this.cacheIdx[0] + data.length);
                this.cacheIdx[1] = this.cacheIdx[0] + data.length;
                break;
            case "compositionend":
                preContent = preContent.substring(0, this.cacheIdx[0]);
                this.cursor.setOffset(this.cacheIdx[0] + data.length);
                this.cacheIdx = null;
                preContent += data;
                _currElement.changeSource(preContent + afterContent);
                break;
            
            case 'Enter':
                _currElement.changeSource(preContent);
                _currElement.needWrap = true;
                const idx = this.elements.findIndex(el => el === _currElement);
                const nextElement = this.elements[idx+1];
                if(nextElement && !(nextElement instanceof Structure)) {
                    nextElement.changeSource(afterContent + nextElement.source);
                } else {
                    const t = new TextElement(afterContent);
                    this.insertElement(t, idx + 1);
                }
                this.cursor.moveToNextElemet();
            break;
        }
        this.refreshCursor();
    }

    _currElement() {
        const i = this.cursor.element.slice();
        let temp = this;
        while(i.length > 0) {
            const c = i.shift();
            temp = temp.elements[c];
        }
        return temp;
    }

    _jumpCursorWithCoord(point) {
        const hitStack = [];
        let textOffset = 0;
        const t = this.isHit(point, (target, idx, offset) => {
            if(offset) {
                textOffset = offset;
            }
            if(idx !== undefined) {
                hitStack.unshift(idx);
            }
        })

        if(!t){
            const element = getListTail(this.elements);
            this.cursor.set({
                element: [this.elements.length - 1],
                offset:  element.tailOffset(),
            })
        } else if(t === this){
            let reduceHeight = 0;
            const lineSpace = Configration.paragraph.lineSpace;
            const hls = lineSpace / 2;
            const [a, b] = point;
            let i, j;
            const lines = this.lines;
            const l = lines.length;
            for(i = 0; i < l; i++) {
                const nextHeight = lines[i].height + reduceHeight + hls;
                if(nextHeight >  b && reduceHeight < b) {
                    break; 
                }
                reduceHeight = nextHeight + hls;
            }
            const element = getListTail(lines[i].elements);
            this.cursor.set({
                element: [getElementIndexInList(element, this.elements)],
                offset:  element.tailOffset(),
            })
        } else {
            this.cursor.set({
                element: hitStack,
                offset:  textOffset,
            })
        }
        console.log(JSON.stringify(this.cursor));
    }

    refreshCursor() {
        this._editStatus.cursorFlash = true;
        this._editStatus.lastElapsed = Date.now();
    }

    renderCursor(ctx) {
        if(this._editStatus.cursorFlash) {
            ctx.save();
            const cursorLength = Configration.font.fontSize + 4;
            const _currElement = this._currElement();
            const structure = _currElement.parent;
            const offset = this.cursor.offset;
            const source = _currElement.source;
            const c = source.substring(0, offset);
            let cx = _currElement.x + ctx.measureText(c).width;
            let cy = _currElement.y;
            
            [cx, cy] = calculateUpToTopCoord(structure, cx, cy);
            ctx.beginPath();
            ctx.moveTo(cx, cy - cursorLength/2);
            ctx.lineTo(cx, cy + cursorLength/2);
            ctx.lineWidth = 2;
            ctx.strokeStyle = Configration.cursor.color;
            ctx.stroke();
            ctx.restore();
        }
    }

    render(ctx) {
        super.render(ctx);
        this.renderCursor(ctx);
    }

}

export default Editor;