// import { INSTANCE_TYPE } from './base';
// import Composite from './composite';
// import EditArea from './edit-area';
// import EditLine from './edit-line';
import TextElement from './text-element';

// export default function(type) {
//     switch(type) {
//         case INSTANCE_TYPE.COMPOSITE:
//             return Composite.create();
//         case INSTANCE_TYPE.EDIT_AREA:
//             return EditArea.create();
//         case INSTANCE_TYPE.LINE:
//             return EditLine.create();
//         case INSTANCE_TYPE.TEXT_ELEMENT:
//             return TextElement.create();
//     }
// }

import { DepthFirstLoopMeta, DepthLastLoopMeta } from "../utils";

export function getFirstTextElementFromInstance(instance) {
    let i;
    DepthFirstLoopMeta(instance, node => {
        if(node instanceof TextElement) {
            i = node;
            return true;
        }
    });
    return i
}

export function getLastTextElementFromInstance(instance) {
    let i;
    DepthLastLoopMeta(instance, node => {
        if(node instanceof TextElement) {
            i = node;
            return true;
        }
    });
    return i
}


export function splitTextElementContent(textElement, offset) {
    const content = textElement.source;
    const preContent = content.substring(0, offset);
    const afterContent = content.substring(offset);
    return [preContent, afterContent];
}