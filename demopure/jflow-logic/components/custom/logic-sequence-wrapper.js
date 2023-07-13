import { Rectangle, GroupFactory } from '@joskii/jflow';
import { DIRECTION } from './utils';
// import { cacheMixinForGroup } from './cache/block-cache';

const RADIUS = 4;
const SLOT_WIDTH = 45;
const SLOT_SHIFT = 14;
const SLOT_HEIGHT = 4;
const _q1 = SLOT_SHIFT + SLOT_HEIGHT;
const _q2 = SLOT_SHIFT - SLOT_HEIGHT - SLOT_HEIGHT + SLOT_WIDTH
const _q3 = SLOT_SHIFT + SLOT_WIDTH;
class t extends Rectangle {
    constructor(configs) {
        super(configs);
        this.indicatorColor = configs.indicatorColor;
        this.hideSlot = configs.hideSlot;
        this.hasFooter = configs.hasFooter;
        this.strokeFooter = configs.strokeFooter; 
    }

    get hideSlotEnhanced() {
        return this.hideSlot || this._belongs._belongs !== this._jflow;
    }

    _renderPath(ctx, x, y, xt, yt) {
        if(!this.borderRadius) {
            ctx.rect(x, y, xt-x, yt-y);
        }
        const radius = RADIUS;
        if(!this.hideSlotEnhanced) {
            ctx.moveTo(x, y);
            ctx.lineTo(x + SLOT_SHIFT, y);
            ctx.lineTo(x + _q1, y - SLOT_HEIGHT);
            ctx.lineTo(x + _q2, y - SLOT_HEIGHT);
            ctx.lineTo(x + _q3, y);
        } else {
            ctx.moveTo(x + radius, y);
        }
        ctx.lineTo(xt - radius, y);
        ctx.quadraticCurveTo(xt, y, xt, y + radius);
        ctx.lineTo(xt, yt - radius);
        ctx.quadraticCurveTo(xt, yt, xt - radius, yt);
        if(!this.hideSlotEnhanced) {
            ctx.lineTo(x + _q3, yt);
            ctx.lineTo(x + _q2, yt - SLOT_HEIGHT);
            ctx.lineTo(x + _q1, yt - SLOT_HEIGHT);
            ctx.lineTo(x + SLOT_SHIFT, yt);
            ctx.lineTo(x, yt);
        } else {
            ctx.lineTo(x + radius, yt);
            ctx.quadraticCurveTo(x, yt, x, yt - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
        }
        ctx.closePath();
    }

    render(ctx) {
        ctx.save();
        if(this._isMoving){
            ctx.globalAlpha = 0.6
        }

        const { width, height, anchor, borderWidth } = this;
        const radius = RADIUS;
        const x = anchor[0] - width / 2;
        const y = anchor[1] - height / 2;
        const yt = y + height;
        const xt = x + width;
        ctx.beginPath();
        const shapePath = new Path2D();
        this._renderPath(shapePath, x, y, xt, yt);
        
        if(borderWidth) {
            ctx.lineWidth = borderWidth;
            ctx.strokeStyle = this.borderColor;
        }
        
        if(this.shadowColor && this.shadowColor !== 'transparent') {
            ctx.shadowColor = this.shadowColor;
            const scale = this._jflow.scale;
            ctx.shadowBlur = this.shadowBlur * scale;
            ctx.shadowOffsetX = this.shadowOffsetX * scale;
            ctx.shadowOffsetY = this.shadowOffsetY * scale;
            const switchPath = new Path2D();
            this._renderPath(switchPath, x, y, xt, yt);
            switchPath.closePath();
            switchPath.rect(x - 10, y - 10, width + 20, height + 20);
            ctx.save();
            ctx.clip(switchPath, "evenodd");
            ctx.stroke();
            ctx.restore();
        }  
        if(this.backgroundColor !== 'transparent'){
            ctx.fillStyle = this.backgroundColor;
            ctx.fill(shapePath);
        }
        if(this.hasFooter) {
            if(this.strokeFooter) {
                const switchPath = new Path2D();
                this._renderPath(switchPath, x, y, xt, yt);
                ctx.clip(switchPath);
                ctx.beginPath();
                ctx.rect(x, yt-32, width, 32);
                ctx.fillStyle = '#F9F9F9';
                ctx.fill();
                ctx.strokeStyle = '#E5E5E5';
                ctx.lineWidth = 2;
                ctx.stroke(switchPath);
               
            } else {
                ctx.beginPath();
                ctx.rect(x, yt-32, width, 32);
                ctx.fillStyle = '#F9F9F9';
                ctx.fill();
            }
            
        }
        if(this.borderRadius && borderWidth) {
            ctx.shadowColor = 'transparent'
            ctx.stroke(shapePath);
        }
        

        const hbw = borderWidth/2;
        if(this.indicatorColor) {
            if(this.hideSlotEnhanced) {     
                const ty = y - hbw;
                const tx = x - hbw
                const txr = xt + hbw;
                ctx.beginPath();
                let topPath = new Path2D();
                topPath.moveTo(tx, ty + radius);
                topPath.quadraticCurveTo(x, ty, tx + radius, ty);
                topPath.lineTo(txr - radius, ty);
                topPath.quadraticCurveTo(txr, ty, txr, ty + radius);
                topPath.closePath();
                ctx.clip(topPath);   
                
                ctx.save();
                ctx.shadowColor = 'transparent';
                ctx.fillStyle = this.indicatorColor;
                ctx.rect(tx, ty, this.width + hbw*2, 4);
                ctx.fill();
                ctx.restore();
            
            } else {
                ctx.beginPath();
                ctx.shadowColor = 'transparent';
                ctx.fillStyle = this.indicatorColor;
                ctx.rect(x-2, y-hbw, 4, this.height+borderWidth);
                ctx.fill();
            }
        }

       

        ctx.restore();
    }
}

const _t = GroupFactory(t);
class LogicSeqWrapper extends _t {
    constructor(configs) {
        super(configs);
        this.hasFooter = configs.hasFooter;
        this.surface = !!configs.surface;
        // this.initCache(configs);
    }

    _setPadding(configs) {
        this.padding = {
            top: configs.paddingTop || configs.padding || 0,
            right: configs.paddingRight || configs.padding || 0,
            bottom: configs.paddingBottom || configs.padding || 0,
            left: configs.paddingLeft || configs.padding || 0,
        };
        if(configs.hasFooter) {
            this.padding.bottom += 34;
        }
    }
    
    getIntersectionsInFourDimension() {
        let p2 = this.anchor;
        if(this._belongs && this._belongs.calculateToCoordination) {
            p2 = this._belongs.calculateToCoordination(p2);
        }

        const [x2, y2] = p2;
        const linkShiftX = this.linkShiftX || 0;
        const w = this.width/2;
        const h = this.height/2;
        return {
            [DIRECTION.RIGHT]:  [x2+w, y2],
            [DIRECTION.LEFT]:   [x2-w, y2],
            [DIRECTION.BOTTOM]: [x2+linkShiftX, y2+h],
            [DIRECTION.TOP]:    [x2+linkShiftX, y2-h],
            [DIRECTION.SELF]:   [x2+w*0.618, y2+h*0.618]
        }
    }
}

// Object.assign(LogicSeqWrapper.prototype, cacheMixinForGroup);

export default LogicSeqWrapper;
