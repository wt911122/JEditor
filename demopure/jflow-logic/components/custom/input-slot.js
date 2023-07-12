import { Rectangle } from '@joskii/jflow';
const caheCanvas = document.createElement('canvas');
caheCanvas.width = 1;
caheCanvas.height = 1;
const caheCanvasctx = caheCanvas.getContext('2d');
const scale = window.devicePixelRatio;
caheCanvasctx.scale(scale, scale);

function wrapText(text, font, maxWidth, lineHeight) {
    caheCanvasctx.clearRect(0, 0, 5, 5);
    caheCanvasctx.save();
    caheCanvasctx.font = font;
    const words = text.split(' ');
    let line = '';
    let i;
    let test;
    let metrics;
    let y = 0;
    const _lines = [];

    for (i = 0; i < words.length; i++) {
        test = words[i];
        metrics = caheCanvasctx.measureText(test);
        while (metrics.width > maxWidth) {
            // Determine how much of the word will fit
            test = test.substring(0, test.length - 1);
            metrics = caheCanvasctx.measureText(test);
        }
        if (words[i] != test) {
            words.splice(i + 1, 0, words[i].substr(test.length));
            words[i] = test;
        }

        test = line + words[i] + ' ';
        metrics = caheCanvasctx.measureText(test);

        if (metrics.width > maxWidth && i > 0) {
            _lines.push({
                y, content: line, width: metrics.width,
            });
            line = words[i] + ' ';
            y += lineHeight;
        } else {
            line = test;
        }
    }
    _lines.push({
        y, content: line, width: metrics.width,
    });
    caheCanvasctx.restore();
    caheCanvasctx.clearRect(0, 0, 5, 5);
    return _lines;
}

const PLACEHOLDER = '输“/”快捷插入';
class InputSlot extends Rectangle {
    constructor(configs) {
        super(configs);
        this.iconColor = configs.iconColor;
        this.textColor = configs.textColor;
        this.width = 103;
        this.height = 24;
        this.fontFamily = 'PingFang SC';
        this.fontSize = configs.fontSize || '12px';
        this.content = configs.content || '';
        this.lineHeight = configs.lineHeight;
        this.maxWidth = configs.maxWidth;
        this.minWidth = configs.minWidth;
        this.padding = 6;
        this.editting = false;
        this.disabled = configs.disabled;
        this.measureHolderText();
        this.width = this.defaultWidth;
        if (this.content) {
            this.recalculateMeta();
        }
    }

    setConfig(configs) {
        Object.keys(configs).forEach((k) => {
            if (configs[k] !== undefined && configs[k] !== null) {
                if (k === 'content' && this.content !== configs[k]) {
                    this[k] = configs[k];
                } else {
                    this[k] = configs[k];
                }
                this._rawConfigs[k] = configs[k];
            }
        });
        if (this.content) {
            this.recalculateMeta();
        } else {
            this.width = this.defaultWidth;
            this.height = 24;
        }
    }

    measureHolderText() {
        caheCanvasctx.save();
        caheCanvasctx.font = `${this.fontSize} ${this.fontFamily}`;
        const metrics = caheCanvasctx.measureText(PLACEHOLDER);
        // this.placeholderWidth = metrics.width;
        this.defaultWidth = metrics.width + 25;
        caheCanvasctx.restore();
    }

    recalculateMeta() {
        this._lines = wrapText(this.content, `${this.fontSize} ${this.fontFamily}`, this.maxWidth, this.lineHeight);
        if (this._lines.length === 1) {
            this.width = Math.max(this._lines[0].width, this.minWidth) + 24;
        } else {
            this.width = this.maxWidth + 24;
        }
        this.height = this.lineHeight * this._lines.length + this.padding * 2;
    }

    _drawPath(ctx, x, y, xt, yt, radius) {
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
        ctx.save();
        if (this._isMoving) {
            ctx.globalAlpha = 0.6;
        }
        const scale = this._jflow.scale;

        const {
            borderRadius: radius, anchor, width, height,
        } = this;
        const x = anchor[0] - width / 2;
        const y = anchor[1] - height / 2;
        const xt = x + width;
        const yt = y + height;
        ctx.beginPath();
        this._drawPath(ctx, x, y, xt, yt, radius);

        ctx.lineWidth = this.borderWidth;
        ctx.strokeStyle = this.borderColor;

        if (this.shadowColor && this.shadowColor !== 'transparent') {
            ctx.shadowColor = this.shadowColor;
            const scale = this._jflow.scale;
            ctx.shadowBlur = this.shadowBlur * scale;
            ctx.shadowOffsetX = this.shadowOffsetX * scale;
            ctx.shadowOffsetY = this.shadowOffsetY * scale;
            const switchPath = new Path2D();
            this._drawPath(switchPath, x, y, xt, yt, radius);
            switchPath.rect(x - 10, y - 10, width + 20, height + 20);
            ctx.save();
            ctx.clip(switchPath, 'evenodd');
            ctx.stroke();
            ctx.restore();
        }

        ctx.fillStyle = this.backgroundColor;
        ctx.fill();
        if (this.borderRadius && this.borderWidth) {
            ctx.shadowColor = 'transparent';
            ctx.stroke();
        }
        if (this.content) {
            ctx.translate(x + 2, y + 6);
            ctx.save();
            ctx.translate(0, height / 2 - 12);
            ctx.fillStyle = this.iconColor;
            let p = new Path2D('M11.0965 0.519825C10.9465 0.507985 10.7949 0.501953 10.6419 0.501953C7.92857 0.501953 5.50953 2.73318 4.89521 5.53369L2.64172 5.52782C2.47294 5.52738 2.37954 5.7233 2.48614 5.85414L6.0211 10.1929C6.18095 10.3891 6.48053 10.3894 6.64078 10.1936L10.1753 5.87369C10.282 5.74329 10.1896 5.54748 10.0211 5.54704L8.04745 5.5419C8.29112 2.72379 9.35377 1.75735 11.0965 0.519825Z');
            ctx.fill(p);
            p = new Path2D('M2.59844 11C2.48798 11 2.39844 11.0895 2.39844 11.2V11.8C2.39844 11.9105 2.48798 12 2.59844 12H10.1984C10.3089 12 10.3984 11.9105 10.3984 11.8V11.2C10.3984 11.0895 10.3089 11 10.1984 11H2.59844Z');
            ctx.fill(p);
            ctx.translate(0, -height / 2 + 12);
            // const padding =  this.padding;
            ctx.beginPath();

            ctx.font = `${this.fontSize} ${this.fontFamily}`;
            ctx.textBaseline = 'top';
            ctx.fillStyle = this.textColor;

            this._lines.forEach((l) => {
                ctx.fillText(l.content, 16, l.y);
            });
            ctx.translate(-x - 2, -y - 6);
            ctx.restore();
            // const hw = width / 2;
            // const hy = height / 2;
            // const ty = anchor[1] - hy;
            // const tx = anchor[0] - hw;
            // const padding =  this.padding;
            // ctx.beginPath();

            // ctx.font = `${this.fontSize} ${this.fontFamily}`;
            // ctx.textBaseline = 'top';
            // ctx.fillStyle = this.textColor;

            // this._lines.forEach((l) => {
            //     ctx.fillText(l.content, tx + padding, ty + l.y + padding);
            // });
        } else if (scale > 0.25) {
            ctx.translate(x + 2, y + 6);
            ctx.save();
            ctx.fillStyle = this.iconColor;
            let p = new Path2D('M11.0965 0.519825C10.9465 0.507985 10.7949 0.501953 10.6419 0.501953C7.92857 0.501953 5.50953 2.73318 4.89521 5.53369L2.64172 5.52782C2.47294 5.52738 2.37954 5.7233 2.48614 5.85414L6.0211 10.1929C6.18095 10.3891 6.48053 10.3894 6.64078 10.1936L10.1753 5.87369C10.282 5.74329 10.1896 5.54748 10.0211 5.54704L8.04745 5.5419C8.29112 2.72379 9.35377 1.75735 11.0965 0.519825Z');
            ctx.fill(p);
            p = new Path2D('M2.59844 11C2.48798 11 2.39844 11.0895 2.39844 11.2V11.8C2.39844 11.9105 2.48798 12 2.59844 12H10.1984C10.3089 12 10.3984 11.9105 10.3984 11.8V11.2C10.3984 11.0895 10.3089 11 10.1984 11H2.59844Z');
            ctx.fill(p);
            ctx.fillStyle = this.textColor;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.font = `12px PingFang SC`;
            ctx.fillText(PLACEHOLDER, 14, 6);
            ctx.translate(-x - 2, -y - 6);
            ctx.restore();
        }

        ctx.restore();
    }
}
export default InputSlot;
