import { Rectangle, GroupFactory } from '@joskii/jflow';

const swapPath = new Path2D('M8.04546,6.36386C8.12899,6.36386,8.21048,6.38973,8.27872,6.43793C8.27872,6.43793,12.604,9.49325,12.604,9.49325C12.7863,9.6221,12.8297,9.87437,12.7009,10.0567C12.6761,10.0919,12.6458,10.1228,12.6113,10.1484C12.6113,10.1484,8.28603,13.3507,8.28603,13.3507C8.10656,13.4836,7.85338,13.4458,7.72052,13.2663C7.66898,13.1967,7.64116,13.1124,7.64116,13.0258C7.64116,13.0258,7.64116,10.9657,7.64116,10.9657C7.64116,10.9657,4.10514,10.9657,4.10514,10.9657C1.58514,10.98,0.216756,9.73464,0,7.22954C0.218971,7.45882,1.17601,8.81158,4.10514,8.81158C6.0579,8.81158,7.23658,8.78913,7.64116,8.74429C7.64116,8.74429,7.64116,6.76815,7.64116,6.76815C7.64116,6.54486,7.82216,6.36386,8.04546,6.36386ZM5.34002,0.163735C5.39157,0.233353,5.41939,0.317686,5.41939,0.404309C5.41939,0.404309,5.41939,2.46436,5.41939,2.46436C5.41939,2.46436,8.9554,2.46436,8.9554,2.46436C11.4754,2.45003,12.8438,3.69543,13.0605,6.20052C12.8416,5.97125,11.8845,4.61849,8.9554,4.61849C7.00265,4.61849,5.82397,4.64094,5.41939,4.68578C5.41939,4.68578,5.41939,6.66191,5.41939,6.66191C5.41939,6.88521,5.23839,7.06621,5.01509,7.06621C4.93155,7.06621,4.85006,7.04033,4.78183,6.99213C4.78183,6.99213,0.456574,3.93681,0.456574,3.93681C0.274201,3.80796,0.230801,3.5557,0.359631,3.37333C0.384447,3.33819,0.414711,3.30725,0.449279,3.28165C0.449279,3.28165,4.77452,0.079395,4.77452,0.079395C4.95399,-0.0534781,5.20717,-0.0157026,5.34002,0.163752C5.34002,0.163752,5.34002,0.163735,5.34002,0.163735Z');

class t extends Rectangle {
    constructor(configs) {
        super(configs);
        this.outlineColor = configs.outlineColor;
    }

    _drawPath(ctx, x, y, xt, yt, radius) {
        if(radius) {
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
        } else {
            ctx.moveTo(x, y);
            ctx.lineTo(xt, y);
            ctx.lineTo(xt, yt);
            ctx.lineTo(x, yt);
            ctx.closePath(); 
        }
    }

    render(ctx) {
        ctx.save();
        if(this._isMoving){
            ctx.globalAlpha = 0.6
        }

        const {
            borderRadius: radius, anchor, width, height
        } = this;
        const x = anchor[0] - width / 2;
        const y = anchor[1] - height / 2;
        const xt = x + width;
        const yt = y + height;
        if(this.outlineColor && this.outlineColor !== 'transparent') {
            ctx.fillStyle = this.outlineColor;
            ctx.beginPath();
            this._drawPath(ctx, x - 3, y - 3, xt + 3, yt + 3, radius);
            ctx.fill();
        }
        ctx.beginPath();
        this._drawPath(ctx, x, y, xt, yt, radius);

        ctx.lineWidth = this.borderWidth;
        ctx.strokeStyle = this.borderColor;
        
        if(this.shadowColor && this.shadowColor !== 'transparent') {
            ctx.shadowColor = this.shadowColor;
            const scale = this._jflow.scale;
            ctx.shadowBlur = this.shadowBlur * scale;
            ctx.shadowOffsetX = this.shadowOffsetX * scale;
            ctx.shadowOffsetY = this.shadowOffsetY * scale;
            let switchPath = new Path2D();
            this._drawPath(switchPath, x, y, xt, yt, radius);
            switchPath.rect(x - 10, y - 10, width + 20, height + 20);
            ctx.save();
            ctx.clip(switchPath, "evenodd");
            ctx.stroke();
            ctx.restore();
        }  
        ctx.fillStyle = this.backgroundColor;
        ctx.fill();
        if( this.borderRadius && this.borderWidth) {
            ctx.shadowColor = 'transparent'
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

const _t = GroupFactory(t);
class InputGroup extends _t {
    constructor(configs) {
        super(configs);
        this.swapping = configs.swapping;
        this.name = 'InputGroup'
    }

    setConfig(configs) {
        super.setConfig(configs);
        this.swapping = configs.swapping;
    }

    render(ctx) {
        ctx.save();
        if(this._isMoving || this.swapping){
            ctx.globalAlpha = 0.6
        } else if(this.opacity !== 1) {
            ctx.globalAlpha = this.opacity;
        }

        const [cx, cy] = this._getCenter(); 
        const { width, height } = this;
        const x = -width / 2;
        const y = -height / 2;
        const xt = x + width;
        const yt = y + height;
        const b = this._shape.borderWidth/2;
        this._shape.render(ctx);
        ctx.translate(cx, cy);
        if(this._shape.borderRadius) {
            let switchPath = new Path2D();
            const paddingH = (this.padding.left + this.padding.right)/2;
            this._shape._drawPath(switchPath, 
                x + b + paddingH, 
                y + b, 
                xt - b - paddingH, 
                yt - b, this._shape.borderRadius - 1);
            ctx.clip(switchPath);
        }
        this._stack.render(ctx);
        if(this.swapping) {
            ctx.fillStyle = '#0055CC';
            // ctx.beginPath();
            ctx.translate(-6.5, -6.5);
            ctx.fill(swapPath);
            ctx.translate(6.5, 6.5);
        }
        ctx.translate(-cx, -cy);
        ctx.restore();
    }
}
export default InputGroup;
