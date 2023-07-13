export const JEDITOR_SYMBOL = Symbol('JEDITOR_SYMBOL');
export const INSTANCE_TYPE = {
    EDIT_AREA: 'je-edit-area',
    LINE: 'je-edit-line',
    TEXT_ELEMENT: 'je-text-element',
    COMPOSITE: 'je-composite',
}
export const JEDITOR_CONTENT = 'je-content';
export const JEDITOR_CONTAINER = 'je-container';
export const JEDITOR_RANGE = 'je-range';
export const JEDITOR_SELECTION = 'je-selection';
export const JEDITOR_AUTO_COMPLETION = 'je-autocompletion';
export const JEDITOR_ERROR_RANGE = 'je-error-decorator';


export const TOKEN = {
    IDENTIFIER: 'identifier',
    NUMBER: 'number',
    OPERATOR: 'operator',
    TEXT: 'text',
}

export const JEDITOR_EVENTS = {
    FOCUS: 'jeditorfocus',
    FOCUSED: 'jeditorfocused',
    INPUT: 'jeditorinput',
    CONTROL_CMD: 'jeditrocontrol'
}

export const KEYBOARD_INPUT = {
    INPUT: 'input',
    COMPOSITION_START: 'compositionstart',
    COMPOSITION_UPDATE: 'compositionupdate',
    COMPOSITION_END: 'compositionend',
}

export const KEYBOARD_COMMANDS = {
    ARROW_LEFT: 'arrowLeft',
    ARROW_RIGHT: 'arrowRight',
    ARROW_UP: 'arrowUp',
    ARROW_DOWN: 'arrowDown',
    RETURN: 'return',
    DELTET: 'delete',
    UNDO: 'undo',
    REDO: 'redo',
    TAB: 'tab',
    COPY: 'copy',
    PASTE: 'paste'
}

export const OPERRATION = {
    PLAININPUT: 'plaininput',
    SPACEINPUT: 'spaceinput',
    RETURNINPUT: 'returninput',
    CARETMOVEMENT: 'caretmovement',
    DELETE_IN_LINE: 'deleteinline',
    DELETE_IN_EDITAREA: 'deleteineditarea',
    ENSURE_DELETE: 'ensuredelete',
    SELECTION_DELETE: 'selectiondelete',
    SELECTION_INPUT: 'selectioninput',
    COMPOSITE_INSERT: 'compositeinsert'
}