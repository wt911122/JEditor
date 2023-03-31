
class Box {
    width = 0;
    height = 0;
    x = 0;
    y = 0;
    parent = null;

    get boundingbox() {
        return [this.x, this.y, this.x + this.width, this.y + this.height];
    }
    reflow(cacheCanvasCtx) {
        throw 'need implementation'
    }

    isHit(point, callback) {
        if(pointInBox(point, this.boundingbox)) {
            callback(this, 0);
            return this;
        }
        return false;
    }
}

export default Box;

export function pointInBox(point, boundingbox) {
    return point[0] > boundingbox[0]
            && point[0] < boundingbox[2]
            && point[1] > boundingbox[1]
            && point[1] < boundingbox[3]
}

