import Configration from '../model/configration';
import Box, { pointInBox } from "./box";

class Structure extends Box {
    constructor() {
        super();
        this.elements = [];
        this.lines = [];
        this.dirty = true;
    }

    insertElement(element, idx) {
        this.elements.splice(idx, 0, element);
        element.parent = this;
    }
    addElement(element) {
        this.elements.push(element);
        element.parent = this;
    }

    reflow() {
        let line = getNewLine();
        this.lines = [line];
        
        this.elements.forEach(el => {
            if(el.dirty) {
                el.reflow();
            }
            line.elements.push(el);
            line.width += el.width;
            line.height = Math.max(line.height, el.height);
            if(el.needWrap) {
                line = getNewLine();
                this.lines.push(line);
            }
        });

        const lineSpace = Configration.paragraph.lineSpace;
        let reduceHeight = 0;
        let reduceWidth = 0;
        let currWidth;
        this.lines.forEach(({ width, height, elements }) => {
            currWidth = 0;
            elements.forEach(el => {
                el.x = currWidth;
                el.y = el.height/2 + reduceHeight;
                currWidth += el.width;
            });

            reduceWidth = Math.max(width, reduceWidth);
            reduceHeight += height + lineSpace;
        });

        this.width = reduceWidth;
        this.height = reduceHeight - lineSpace;
    }

    render(ctx) {
        const { x, y } = this;
        ctx.translate(x, y);
        this.lines.forEach(({ elements }) => {
            elements.forEach(el => {
                el.render(ctx);
            })
        });
        ctx.translate(-x, -y);
    }

    isHit(point, callback) {  
        const isInBox = pointInBox(point, this.boundingbox);
        if(!isInBox) {
            return false;
        }
        const {x, y} = this;
        const p = [point[0] - x, point[1] - y];
        let i, target;
        const l = this.elements.length;
        for(i = 0; i < l; i++) {
            const el = this.elements[i];
            target = el.isHit(p, callback);
            if(target) {
                callback(target, i);
                return target
            }
        }
        
        if(isInBox) {
            return this;
        }
        return false;
    }
}

function getNewLine() {
    return {
        width: 0,
        height: Configration.paragraph.lineHeight,
        elements: [],
    };
}

export default Structure;

export function calculateUpToTopCoord(structure, x, y) {
    let el = structure;
    while(el) {
        x += el.x;
        y += el.y;
        el = el.parent;
    }
    return [x, y];
}