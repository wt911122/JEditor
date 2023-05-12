class EditorContext {
    monospace = 0;
    monospacedouble = 0;
    // origin = [0, 0];

    setMonoSpace(monospace){
        this.monospace = monospace;
    }
    setMonoSpaceDouble(monospacedouble) {
        this.monospacedouble = monospacedouble;
    }

    // setOrigin(origin) {
    //     this.origin = origin;
    // }
}

export default EditorContext;

export function getTextWidth(text, font) {
    // re-use canvas object for better performance
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
}