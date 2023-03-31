import { Configration } from '../configrations';
import Base from '../elements/base';
import { JEDITOR_MODEL_REF } from '../constants';
import { JEditorStructure } from '../elements/structure';
import { getCaretPosition, getCaretToken } from '../utils/index'
import { JEditorElement } from '../elements/element';
import { SuggestionElemCtor } from '../components/index';
import { astWalker } from './language';

class Editor extends EventTarget{
    constructor(configs) {
        super();
        Base.prototype.__context__ = {
            editor: this,
            lang: configs.lang,
        }
        
        const lang = Configration.getLanguage(configs.lang);
        this._language = lang;
        this.elements = lang.resolve(configs.source);
        this.suggestionElem = new SuggestionElemCtor();
        this._currElement = null;
        this._cacheIdx = null;
        console.log(this.elements)
    }

    _resolveElement(element) {
        element._context = this._context;
        return element;
    }

    onInput(op, data) {
        const offset = getCaretPosition(this._currElement);
        const content = this._currElement.source;
        let preContent = content.substring(0, offset);
        let afterContent 
        if(this._cacheIdx) {
            afterContent = content.substring(this._cacheIdx[1]);
        } else {
            afterContent = content.substring(offset);
        }
        let nextOffset = offset;
        switch(op){
            case "Input":
                preContent += data;
                this._currElement.updateSource(preContent + afterContent);
                nextOffset += data.length;
                break;
            case "compositionstart":
                this._cacheIdx = [preContent.length, preContent.length];
                break;
            case "compositionupdate":
                break;
            case "compositionend":
                preContent = preContent.substring(0, this._cacheIdx[0]);
                this._cacheIdx = null;
                preContent += data;
                this._currElement.updateSource(preContent + afterContent);
                nextOffset = preContent.length;
                break;
            case "Backspace":
                if(preContent.length === 0) {
                    const prevNode = this._getSiblingElement(-1);
                    if(prevNode instanceof JEditorStructure) {
                        const parentNode = this._getParentNodeOfCurrElement();
                        const prevprev = this._getSiblingElement(-2);
                        const after = this._currElement;
                        const remainContent = prevNode.onDestroy();
                        let idx = this._getCurrElementIdx();
                        let removeItems = 1;
                        let content = remainContent;
                        let offset = content.length;
                        if(prevprev && prevprev instanceof JEditorElement) {
                            idx -= 2;
                            removeItems += 1;
                            offset += prevprev.source.length;
                            content = `${prevprev.source}${content}`;
                        }

                        if(after && after instanceof JEditorElement) {
                            removeItems += 1;
                            content = `${content}${after.source}`;
                        }
                        const node = new JEditorElement(content);
                        parentNode.updateBy(idx, removeItems, [node]);
                        this._currElement = node;
                        this._currElement.body(offset);
                        this.suggestionElem.replaceItems([]);
                        return;
                    }
                } else {
                    preContent = preContent.substring(0, preContent.length - 1);
                    this._currElement.updateSource(preContent + afterContent);
                    nextOffset = preContent.length; 
                }
                break;

        }
        this.update();

        this._currElement.body(nextOffset);
        if(op !== 'Backspace') {
            this._language.requestSuggestions(this._currElement, nextOffset).then((items) => {
                this.suggestionElem.replaceItems(items);
            }).catch(() => {
                this.suggestionElem.replaceItems([]);
            }) 
        }
        
        console.log(this._currElement.source)
    }

    _getParentNodeOfCurrElement() {
        let parentNode = this._currElement.parent;
        if(parentNode === 'root') {
            parentNode = this;
        }
        return parentNode;
    }

    _getCurrElementIdx() {
        const parentNode = this._getParentNodeOfCurrElement();
        return parentNode.elements.findIndex(el => el === this._currElement);
    }

    _getSiblingElement(offset) {
        const parentNode = this._getParentNodeOfCurrElement();
        const idx = parentNode.elements.findIndex(el => el === this._currElement);
        return parentNode.elements[idx+offset];
    }

    onSelect(op, event) {
        if(this.suggestionElem.isActive) {
            event.preventDefault();
            switch(op){
                case "ArrowUp":
                    this.suggestionElem.up();
                    break;
                case "ArrowDown":
                    this.suggestionElem.down();
                    break;
                case "Enter": 
                    const parentNode = this._getParentNodeOfCurrElement();
                    const currIndex = parentNode.elements.findIndex(n => n === this._currElement);
                    const token = getCaretToken(this._currElement);

                    const idx = this._currElement._tokens.findIndex(t => t === token);
                    const beforToken = this._currElement._tokens.slice(0, idx);
                    const afterToken = this._currElement._tokens.slice(idx+1);
                    const beforeContent = beforToken.map(t => t.text).join('');
                    const afterContent = afterToken.map(t => t.text).join('');
                    
                    let nodes = [];
                    // if(beforeContent) {
                    nodes.push(new JEditorElement(beforeContent) || ' ');
                    // }
                    const node = this.suggestionElem.select();
                    node.parent = this._currElement.parent;
                    nodes.push(node);
                    // if(afterContent) {
                    nodes.push(new JEditorElement(afterContent || ' '));
                    // }
                    parentNode.updateBy(currIndex, 1, nodes);
                    this.focus(node);
                    this.suggestionElem.replaceItems([]);
                    
                    break;
            }
            
        }
    }

    closeSuggestion() {
        this.suggestionElem.replaceItems([]);
    }

    getCaretPositionOnCurrElement() {
        
        const offset = getCaretPosition(this._currElement);
        return {
            isHead: offset === 0,
            isTail: offset === this._currElement.source.length,
            offset,
        }
    }

    moveCurrEditorElement(step) {
        const idx = this._textElementList.findIndex(ele => ele === this._currElement);

        if(step === 1) {
            this.focus(this._textElementList[idx + 1] || this._currElement);
            this._currElement.head();
            console.log(this._currElement)
        }
        if(step === -1) {
            this.focus(this._textElementList[idx - 1] || this._currElement);
            this._currElement.tail();
            console.log(this._currElement)
        }
    }

    render(wrapperDom, dom) {
        this.wrapperDom = wrapperDom;
        this.suggestionElem.bindToWrapper(dom);
        this.elements.forEach(el => {
            el.render(wrapperDom)
        });
        this.update();
        this.cacheTextElementInList();
    }

    cacheTextElementInList() {
        let list = [];
        this.traverseFirstOrder((elem) => {
            if(elem instanceof JEditorElement) {
                list.push(elem);
            }
        });
        this._textElementList = list;
    }

    update() {
        this.elements.forEach(el => {
            el.update();
        });
        try{
            const result = this.parse();
            this.dispatchEvent(new CustomEvent('parsed', {
                detail: {
                    result,
                }
            }))
        }catch(err) {
            console.log(err)
        }
    }

    parse() {
        let expr = '';
        let i = 0
        let map = {};
        this.elements.forEach((el) => {
            if(el instanceof JEditorStructure) {
                const key = `$${i}`;
                expr += key;
                i++;
                map[key] = el;
            } else {
                expr += el.source;
            }
        })
        const result = this._language.parse(expr);
        astWalker(result, null, null, (obj, parent, key) => {
            if(obj.type === "Identifier") {
                const struct = map[obj.name];
                if(struct) {
                    parent[key] = struct._parse(parent, key)
                }
            } else if(typeof obj === 'object') {
                return true;
            }
        });
        console.log(result)
        return result;
    }

    updateBy(idx, deleteNum, elements) {
        elements.forEach(el => {
            el.parent = 'root';
        })
        const children = Array.from(this.wrapperDom.children);
        const elm = this.wrapperDom;
        this.elements.splice(idx, deleteNum, ...elements);
        children.splice(idx, deleteNum, ...elements.map(el => {
            el.render(elm);
            el.update();
            return el.domElement;
        }));
        this.wrapperDom.replaceChildren(...children);
    }

    focus(element) {
        const curElement = element.focus();
        if(this._currElement !== curElement) {
            this._currElement = curElement;
           
        }
    }

    blur() {
        this._currElement = null;
    }


    traverseFirstOrder(callback, condition) {
        const l = this.elements.length;
        for(let i = 0; i < l; i++) {
            const elem = this.elements[i];
            if(condition && condition(elem)) {
                const result = callback(elem);
                if(!result) {
                    return;
                }
            } else {
                callback(elem)
            }
            if(elem instanceof JEditorStructure) {
                elem.traverseFirstOrder(callback)
            }
        }
    }
    
}

export default Editor;