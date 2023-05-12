import { JEDITOR_CONTENT, JEDITOR_CONTAINER, JEDITOR_SYMBOL, JEDITOR_EVENTS, INSTANCE_TYPE } from './constants';
import { makeElement } from './components/dom';
import Caret from './infrastructure/caret';
import ShadowInput from './infrastructure/shadow-input';

import { resolveContextMeta } from './language/language-context';
import { getFirstTextElementFromInstance } from './instance/utils';
import EditorContext, { getTextWidth } from './editor-context';

import { 
    ArrowLeftCommand,
    ArrowRightCommand,
    ReturnCommand,
    DeleteCommand,
    UndoCommand,
    RedoCommand,
} from './commands/index'
import Input from './input/input';
import Range from './infrastructure/range';
import UndoRedo from './infrastructure/undoredo';
import { targetLockOn, findNextSibling } from './utils';

class JEditor {
    constructor(configs = {}) {
        this.lang = configs.language;
        this.editorContext = new EditorContext();
        this.input = new Input();
        this.undoredo = new UndoRedo();
        this.input._editor = this;
        this.undoredo._editor = this;
        this.commands = new Map();
        

        this.registCommand(ArrowLeftCommand);
        this.registCommand(ArrowRightCommand);
        this.registCommand(ReturnCommand);
        this.registCommand(DeleteCommand);
        this.registCommand(UndoCommand);
        this.registCommand(RedoCommand);
    }

    registCommand(cmd) {
        if(!this.commands.has(cmd.name)) {
            this.commands.set(cmd.name, cmd.create(this));
        }
    }

    $mount(wrapper, context) {
        const containerElement = makeElement({ 
            tag: JEDITOR_CONTAINER,
            style: {
                position: 'relative',
            },
            className: ['jeditor-container'],
        });
        const contentElement = makeElement({ 
            tag: JEDITOR_CONTENT,
            className: ['jeditor-content'],
        });
        this.contentElement = contentElement;
        this.containerElement = containerElement;
        const instance = resolveContextMeta(context, this);
        this.editareaRoot = instance;
        contentElement.append(instance.documentElement);
        const caret = Caret.create(this);
        this.caret = caret;
        const shadowInput = ShadowInput.create();
        this.shadowInput = shadowInput;
        const range = Range.create(this);
        this.range = range;
        containerElement.append(shadowInput.documentElement, contentElement, range.documentElement, caret.documentElement); 
        containerElement[JEDITOR_SYMBOL] = this;
        wrapper.append(containerElement);
        this.initializeContext();
        // caret.focus(getFirstTextElementFromInstance(instance));

        this.initializeEventHandler();

       
    }

    initializeContext() {
      
        const font = getComputedStyle(this.contentElement.childNodes[0]).font;
        const w = getTextWidth('B', font)
        this.editorContext.setMonoSpace(w);
        const w2 = getTextWidth('文', font)
        this.editorContext.setMonoSpaceDouble(w2);
    }

    initializeEventHandler() {
        // this.contentElement.addEventListener(JEDITOR_EVENTS.FOCUS, (e) => {
        //     const {
        //         textElement, offset
        //     } = e.detail;
        //     this.caret.focus(textElement, offset);
        // });
        this.shadowInput.addEventListener(JEDITOR_EVENTS.CONTROL_CMD, e => {
            const kind = e.detail.kind;
            const cmd = this.commands.get(kind);
            cmd.exec();
        });

        this.shadowInput.addEventListener(JEDITOR_EVENTS.INPUT, e => {
            this.input.handle(e.detail.kind, e.detail.data)
        });
        let flag = false;
        this.contentElement.addEventListener('pointerdown', e => {

            /** 测试用
            const boundary = targetLockOn(e.target, e.clientX, e.clientY, this.editorContext, this);
            if(!flag) {
                this.range.setInitialBoundary(boundary);
                flag = true;
            } else {
                flag = false;
                const boundary = targetLockOn(e.target, e.clientX, e.clientY, this.editorContext, this);
                if(boundary) {
                    console.log(boundary);
                    this.range.setCurrentBoundary(boundary);
                    const selections = this.range._resolveRange();
                    this.range.render(Range.renderSelections(selections, this.editorContext, this.getContentBoundingClientRect()));
                    console.log(selections);
                }
            }
            document.addEventListener('pointerup', (e) => {
                const boundary = targetLockOn(e.target, e.clientX, e.clientY, this.editorContext, this);
                this.caret.focus(boundary.textElement, boundary.offset);
            }, {
                once: true,
            }) */

            
            const boundary = targetLockOn(e.target, e.clientX, e.clientY, this.editorContext, this);
            this.range.clear();
            this.range.setInitialBoundary(boundary);
            
            const f = (e) => {
                const boundary = targetLockOn(e.target, e.clientX, e.clientY, this.editorContext, this);
                if(boundary) {
                    this.range.setCurrentBoundary(boundary);
                    this.caret.focus(boundary.textElement, boundary.offset);
                    this.resolveRange();
                }
                
            }
            document.addEventListener('pointermove', f);
            document.addEventListener('pointerup', (e) => {
                document.removeEventListener('pointermove', f);
                const selections = this.range.getSelections();
                console.log(selections)
                if(selections.length > 0) {
                    const lastSelection = selections[selections.length - 1];
                    switch(lastSelection.type) {
                        case INSTANCE_TYPE.TEXT_ELEMENT:
                            this.caret.focus(lastSelection.scope, lastSelection.offset[1]);
                            break;
                        case INSTANCE_TYPE.COMPOSITE:
                            const textElement = findNextSibling(lastSelection.scope);
                            this.caret.focus(textElement, 0);
                            break;
                    }
                   
                } else {
                    const boundary = targetLockOn(e.target, e.clientX, e.clientY, this.editorContext, this);
                    this.caret.focus(boundary.textElement, boundary.offset);
                }
                
            }, {
                once: true,
            })
         
        })
    }

    getEditorContext() {
        return this.editorContext;
    }

    getContentBoundingClientRect() {
        return this.contentElement.getBoundingClientRect();
    }
    getContainerInnerBoundingClientRect() {
        return this.containerElement.getBoundingClientRect();
    }
    scrollContent(x=0, y=0) {
        this.containerElement.scrollTo(x, y);
    }
    resolveRange() {
        this.range.resolveRange(this.editorContext, this.getContentBoundingClientRect());
    }
}

import './components/index';
export default JEditor;