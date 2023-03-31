export function createCanvas(wrapper) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const { width, height, left, top } = wrapper.getBoundingClientRect();
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.style.userSelect = 'none';
    canvas.style.cursor = 'text';
    const scale = window.devicePixelRatio;
    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);

    if(wrapper) {
        wrapper.style.position = 'relative';
        wrapper.style.overflow = 'hidden';
        wrapper.append(canvas);
    }
    return {
        canvas,
        width,
        height,
        raw_width: canvas.width,
        raw_height: canvas.height,
        left,
        top,
        ctx,
        scale,
    }
}

export function resizeCanvas(canvas, wrapper) {
    const { width, height, left, top } = wrapper.getBoundingClientRect();
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    const scale = window.devicePixelRatio;
    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);
    return {
        width,
        height,
        raw_width: canvas.width,
        raw_height: canvas.height,
    }
}

const cacheCanvas = document.createElement('canvas');
cacheCanvas.width = 1;
cacheCanvas.height = 1;
export const cacheCanvasCtx = cacheCanvas.getContext('2d');
const scale = window.devicePixelRatio;
cacheCanvasCtx.scale(scale, scale);

/**
 * 在离线canvas上绘制元素
 * @param  {render} render - 绘图函数
 */
// export function requestCacheCanvas(render) {
//     cacheCanvasCtx.clearRect(0,0,5,5);
//     cacheCanvasCtx.save();
//     render(cacheCanvasCtx);
//     cacheCanvasCtx.restore();
//     cacheCanvasCtx.clearRect(0,0,5,5);
// }

export function prepareCacheCanvas(render) {
    cacheCanvasCtx.clearRect(0,0,5,5);
    cacheCanvasCtx.save();
    render(cacheCanvasCtx);
}

export function measureTextInCacheCanvas(text) {
    return cacheCanvasCtx.measureText(text);
}

export function clearCacheCanvas() {
    cacheCanvasCtx.restore();
    cacheCanvasCtx.clearRect(0,0,5,5);
}

export function listenOnDevicePixelRatio(callback) {
    function onChange() {
      console.log("devicePixelRatio changed: " + window.devicePixelRatio);
      callback(window.devicePixelRatio);
      listenOnDevicePixelRatio(callback);
    }
    matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`
    ).addEventListener("change", onChange, { once: true });
}


