class ScrollBar {
    constructor(dir, configs = {}) {
        this.anchor = [0,0];
        this.width = configs.barWidth || 4;
        this.height = configs.barWidth || 4;  
        this.barMarginX = configs.barMarginX || 5;
        this.barMarginY = configs.barMarginY || 5;
        this.dir = dir;
        this.plainColor = configs.plainColor || 'rgba(0, 0, 0, 0.15)';
        this.focusColor = configs.focusColor || 'rgba(0, 0, 0, 0.25)';
        this.isFocus = false;
    }
    render(ctx) {
        const [x, y] = this.anchor;
        ctx.save();
        ctx.beginPath();
        if(this.dir === 'x') {
            const radius = this.height / 2;
            const cy = y + radius;
            const by = y + this.height;
            const rc = x + this.width - this.barMarginX*2 - radius;
            const lc = x + this.barMarginX + radius
            ctx.moveTo(lc, by);
            ctx.arc(lc, cy, radius, Math.PI/2, Math.PI/2*3);
            ctx.lineTo(rc, y);
            ctx.arc(rc, cy, radius,  -Math.PI/2, Math.PI/2);
            ctx.closePath();
  
        } else {
            const radius = this.width / 2;
            const tc = y + this.barMarginY + radius;
            const bc = y + this.height - this.barMarginY*2 - radius
            const cx = x + radius;
            const rx = x + this.width;
            ctx.moveTo(x, tc);
            ctx.arc(cx, tc, radius, -Math.PI, 0);
            ctx.lineTo(rx, bc);
            ctx.arc(cx, bc, radius, 0, Math.PI);
            ctx.closePath();
            
        }
        ctx.fillStyle = this.isFocus ? this.focusColor : this.plainColor;
        ctx.fill();
        ctx.restore();
    }
    isHit(point) {
        const anchor = this.anchor;
        const w = this.width;
        const h = this.height;
        return point[0] > anchor[0] - 5
            && point[0] < anchor[0] + w + 5
            && point[1] > anchor[1] - 5
            && point[1] < anchor[1] + h + 5;
    }
}

class ScrollBarManager {
    constructor(configs) {
        const {
            barColor,
            barFocusColor,
            barMarginX,
            barMarginY,
            barWidth,
        } = configs;

        this._scrollbarX = new ScrollBar('x', {
            plainColor: barColor,
            focusColor: barFocusColor,
            barWidth,
            barMarginX,
        });
        this._scrollbarY = new ScrollBar('y', {
            plainColor: barColor,
            focusColor: barFocusColor,
            barWidth,
            barMarginY
        });

        this._scrollBarStatus = {
            dragging: false,
            target: null,
            xscale: undefined,
            yscale: undefined,

            barInitX: 0,
            barInitY: 0,
        }
    }

    bind(jEditor, callback) {
        this.jEditor = jEditor;
        jEditor.canvas.addEventListener('pointerdown', e => {
            const { offsetX, offsetY, clientX, clientY } = e;
            this.onScrollbarPressStart(offsetX, offsetY, clientX, clientY, callback)
        });
        jEditor.addEventListener('pan', () => {
            this.scrollBarOnPanAndZoom();
        });
        this.scrollBarOnPanAndZoom();
    }

    onScrollbarPressStart(offsetX, offsetY, clientX, clientY, callback) {
        const xhit = this._scrollbarX.isHit([offsetX, offsetY]);
        if(xhit) {
            Object.assign(this._scrollBarStatus, {
                dragging: true,
                target: this._scrollbarX,
                barStartX: this._scrollbarX.anchor[0],
                barInitX: clientX,
            });
        }
        const yhit = this._scrollbarY.isHit([offsetX, offsetY]);
        if(yhit) {
            Object.assign(this._scrollBarStatus, {
                dragging: true,
                target: this._scrollbarY,
                barStartY: this._scrollbarY.anchor[1],
                barInitY: clientY,
            });
        }
        if(!xhit && !yhit) {
            return;
        }
        const f = (e => {
            const { clientX, clientY } = e;
            this.onDraggingScrollbar(clientX, clientY, callback)
        }).bind(this);
        
        document.addEventListener('pointermove', f);
        const t = (e => {
            Object.assign(this._scrollBarStatus, {
                dragging: false,
                target: null,
                x: undefined,
                y: undefined,
            });
            document.removeEventListener('pointermove', f);
            document.removeEventListener('pointerup', t);
        }).bind(this);

        document.addEventListener('pointerup', t, {
            once: true
        })
    }

    onDraggingScrollbar(clientX, clientY, callback) {
        if(this._scrollBarStatus.dragging) {
            const {
                target,
                barInitX,
                barInitY,
                scollbarHeight,
                scollbarWidth,
            } = this._scrollBarStatus;
            const { actual_width, actual_height } = this.jEditor.canvasMeta;

            if(target.dir === 'x') {
                const deltaX = clientX - barInitX;
                const ratio = actual_width/scollbarWidth;
                callback([-deltaX * ratio, 0]);
                this._scrollBarStatus.barInitX = clientX;
            }

            if(target.dir === 'y') {      
                const deltaY = clientY - barInitY;
                const ratio = actual_height/scollbarHeight;
                callback([0, -deltaY * ratio]);
                this._scrollBarStatus.barInitY = clientY;

            }
            return true;
        }
        return false;
    }

    scrollBarOnPanAndZoom() {
        // if(this._scrollBarStatus.dragging) {
        //     return;
        // }
        // const { 
        //     width: p_width, 
        //     height: p_height, 
        //     x: p_x, 
        //     y: p_y 
        // } = this._getScrollViewBoundingbox();
        const [xa, xb, xc, xd] = this.jEditor.editorModel.boundingbox;
        const [x, y, r, b] = this.jEditor._cacheViewBox;
        const { actual_width, actual_height } = this.jEditor.canvasMeta;
        const realR = Math.max(r, xc);
        const realL = Math.min(x, xa);
        const realT = Math.min(y, xb);
        const realB = Math.max(b, xd);
        const vw = r - x;
        const vh = b - y;
        const xscale = vw / (realR - realL)
        if(xscale < 1)  {
            const scollbarWidth = actual_width * xscale;
            const anchorX = (x - realL) * xscale;
            this._scrollbarX.anchor = [anchorX, actual_height - 10];
            this._scrollbarX.width = scollbarWidth;
            this._scrollBarStatus.scollbarWidth = scollbarWidth;
        }
        
        const yscale = vh / (realB - realT);
        if(yscale < 1)  {
            const scollbarHeight = actual_height * yscale;
            const anchorY = (y - realT) * yscale
            this._scrollbarY.anchor = [actual_width - 10, anchorY];
            this._scrollbarY.height = scollbarHeight;
            this._scrollBarStatus.scollbarHeight = scollbarHeight;
        }

        Object.assign(this._scrollBarStatus, {
            yscale,
            xscale,
            realR,
            realL,
            realT,
            realB,
        })   
    }

    renderScrollBar(ctx) {
        ctx.setTransform();
        const dpr = window.devicePixelRatio;
        ctx.scale(dpr, dpr);
        const {
            xscale,
            yscale
        } = this._scrollBarStatus;
        if(xscale < 1)  {
            this._scrollbarX.render(ctx);
        }
        if(yscale < 1)  {
            this._scrollbarY.render(ctx);
        }
    }
} 

export default ScrollBarManager;