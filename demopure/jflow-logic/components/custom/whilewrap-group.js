import { GroupFactory, Rectangle } from '@joskii/jflow';
import { DIRECTION } from './utils';

class t extends Rectangle {
    constructor(configs) {
        super(configs);
        this.fontFamily = configs.fontFamily = 'PingFang SC';
        this.borderRadius = 8;
    }


    _renderPath(ctx, x, y, xt, yt) {
        const radius = 8;
        ctx.moveTo(x + radius, y);
        ctx.lineTo(xt - radius, y);
        ctx.quadraticCurveTo(xt, y, xt, y + radius);
        ctx.lineTo(xt, yt - radius);
        ctx.quadraticCurveTo(xt, yt, xt - radius, yt);
        ctx.lineTo(x + radius, yt);
        ctx.quadraticCurveTo(x, yt, x, yt - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    render(ctx) {
        const { width, height, anchor, borderWidth } = this;
        const hwidth = width / 2;
        const hheight = height / 2;
        const [x, y] = anchor;
        const xl = x - hwidth;
        const yl = y - hheight;
        const xt = x + hwidth;
        const yt = y + hheight;
        

        const jflowScale = Math.min(1, this._jflow.scale + 0.1);
        ctx.save();
        ctx.textBaseline = 'bottom';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#333';
        ctx.font = `bold ${12/jflowScale}px ${this.fontFamily}`;
        ctx.fillText('While', x, yl - 8);
        ctx.restore();

        // ctx.fillStyle = 'rgba(79, 144, 248, 0.2)';
        // ctx.beginPath();
        // ctx.moveTo(xt + 6, y + 30);
        // ctx.lineTo(xt + 26, y)
        // ctx.lineTo(xt + 6, y - 30);
        // ctx.closePath();
        // ctx.fill();
        ctx.save();
        ctx.beginPath()
        ctx.rect(xl - 28, y - 24, 24, 48);
        ctx.clip();
        const _pi = Math.PI / 2;
        ctx.beginPath();
        ctx.lineWidth = 12;
        ctx.strokeStyle = 'rgba(151, 178, 14, 0.2)';
        ctx.arc(xl+2, y, 19, _pi, _pi*3);
        ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.rect(xt + 4, y - 24, 24, 48);
        ctx.clip();
        ctx.beginPath();
        ctx.lineWidth = 12;
        ctx.strokeStyle = 'rgba(151, 178, 14, 0.2)';
        ctx.arc(xt-2, y, 19, _pi*3, _pi*5);
        ctx.stroke();
        ctx.restore();
            
        ctx.beginPath();
        this._renderPath(ctx, xl, yl, xt, yt);
        if(borderWidth) {
            ctx.lineWidth = borderWidth;
            ctx.strokeStyle = this.borderColor;
        }
        if(this.shadowColor && this.shadowColor !== 'transparent') {
            ctx.shadowColor = this.shadowColor;
            ctx.shadowBlur = this.shadowBlur * jflowScale;
            ctx.shadowOffsetX = this.shadowOffsetX * jflowScale;
            ctx.shadowOffsetY = this.shadowOffsetY * jflowScale;
            const switchPath = new Path2D();
            this._renderPath(switchPath, xl, yl, xt, yt);
            switchPath.closePath();
            switchPath.rect(xl - 10, yl - 10, width + 20, height + 20);
            ctx.save();
            ctx.clip(switchPath, "evenodd");
            ctx.stroke();
            ctx.restore();
        } 
        ctx.fillStyle = this.backgroundColor;
        ctx.fill();
        if(borderWidth) {
            ctx.shadowColor = 'transparent'
            ctx.stroke();
        }
    }
    isHit(point) {
        const jflowScale = Math.min(1, this._jflow.scale + 0.1);
        const { width, height, anchor } = this;
        const hwidth = width / 2;
        const hheight = height / 2;
        const [x, y] = anchor;
        const xl = x - hwidth;
        const yl = y - hheight - 8;
        const xt = x + hwidth + 26;
        const yt = y + hheight;
        const w = 20 / jflowScale;
        const f = 12 / jflowScale;

        return point[0] > xl
            && point[0] < xt
            && point[1] > yl
            && point[1] < yt || (
                point[0] > x - w
                && point[0] < x + w
                && point[1] > yl - f
                && point[1] < yl
            )
    }
}
const q = GroupFactory(t);

class WhileWrapGroup extends q {
    constructor(configs) {
        super(configs);
        // this.initCache(configs);
    }
    getIntersectionsInFourDimension() {
        let p2 = this.anchor;
        if (this._belongs && this._belongs.calculateToCoordination) {
            p2 = this._belongs.calculateToCoordination(p2);
        }
        const jflowScale = this._jflow.scale + 0.1;
        const [x2, y2] = p2;
        const w = this.width / 2;
        const h = this.height / 2;
        return {
            [DIRECTION.RIGHT]: [x2 + w + 20, y2 - 20],
            [DIRECTION.LEFT]: [x2 - w - 30, y2],
            [DIRECTION.BOTTOM]: [x2, y2 + h],
            [DIRECTION.TOP]: [x2, y2 - h - Math.max(12/jflowScale, 12) - 8],
            [DIRECTION.SELF]: [x2 + w + 20, y2 + 20],
        };
    }
}

// Object.assign(WhileWrapGroup.prototype, cacheMixinForGroup);
export default WhileWrapGroup;
