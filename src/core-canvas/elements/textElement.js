import Box, { pointInBox } from './box';
import { measureTextInCacheCanvas } from '../dom-utils/canvas';
import Configration from '../model/configration';
class TextElement extends Box {
    constructor(source, configs = {}) {
        super();
        this.type = 'plain';
        this.source = source || '';
        this.needWrap = configs.needWrap || false;
        this.dirty = true;
    }

    get isTail() {
        const elems = this.parent.elements;
        return elems[elems.length - 1] === this;
    }

    shift(offset, step, isTail) {
        if(this.type === 'text') {
            const content = this.source;
            const l = content.length;
            const nextOffset = offset + step;
            if(nextOffset < 0) {
                return 'prev';
            }
            if(nextOffset > l ){//- ((isTail || this.needWrap) ? 0 : 1)) {
                return 'next';
            }
            return 'self';
        } else {
            if(step > 0) {
                return 'next';
            } 
            if(step < 0){
                return 'prev';
            }
        }
    }

    tailOffset() {
        if(this.type === 'text') {
            if(this.needWrap || this.isTail){
                return this.source.length;
            } else {
                return Math.max(0, this.source.length - 1);
            }
        } else {
            return 0;
        }
    }

    headOffset() {
        return 0;
    }

    changeSource(source){
        this.source = source;
        this.dirty = true;
    }

    reflow() {
        this.width = measureTextInCacheCanvas(this.source).width;
        this.height = Configration.paragraph.lineHeight;
        this.dirty = false;
    }

    render(ctx) {
        ctx.fillText(this.source, this.x, this.y);
    }

    isHit(point, callback) {
        if(pointInBox(point, this.boundingbox)) {
            callback(this, undefined, this._calculateOffsetByWidth(point[0]));
            return this;
        }
        return false;
    }

    _calculateOffsetByWidth(x) {
        const content = this.source;
        const maxL = content.length - 1;
        if(this.width === 0) {
            return 0;
        }
        let idx = Math.floor(x / this.width * maxL);
        let g1, g2;
        debugger
        do {
            const c0 = content.substring(0, idx-1);
            const c1 = content.substring(0, idx);
            const c2 = content.substring(0, idx+1);
            const w0 = measureTextInCacheCanvas(c0).width;
            const w1 = measureTextInCacheCanvas(c1).width;
            const w2 = measureTextInCacheCanvas(c2).width;
            g1 = (w1 - w0)/2 + w0;
            g2 = (w2 - w1)/2 + w1;
            if(g2 < x) {
                idx+=1
            } else if(g1 > x) {
                idx-=1
            } else if(g1 <= x && g2 >= x) {
                break;
            }
        } while(idx >= 0 && idx <= maxL);
        return idx;
    }
}

export default TextElement;