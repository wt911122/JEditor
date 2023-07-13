
const DIRECTION = {
    /** RIGHT */
    RIGHT: 0,
    /** BOTTOM */
    BOTTOM: 1,
    /** LEFT */
    LEFT: 2,
    /** TOP */
    TOP: 3,
    /** SELF */
    SELF: 100,

    STARTLOOP: 6,
    ENDLOOP: 16,
};

const SPAN_Y = 80;
const SPAN_X = 80;
export class BaseNode {
    constructor(source) {
        this.source = source;
        this.id = source.id;
        this.type = source.concept || source.type;
        this.anchor = source.anchor || [0, 0];
        this.isFree = false;
        this.parent = undefined;
        this.idx = undefined;
        this.parentIterateType = undefined;

        this.hasEndPoint = false;

        this.__width__ = 0;
        this.__links_empty__ = [];
    }

    preprareXCoord(getNodeDimension) {
        const { width } = getNodeDimension(this.source);
        this.__width__ = width;
        this.__nodeWidth__ = width;
        return width;
    }
    reflowXCoord(setNodePosition, reduceX) {
        setNodePosition(this.source, reduceX, 0);
    }

    reflowYCoord(getRenderNode, callbackOnY, reducedHeight) {
        const node = getRenderNode(this.source);
        const height = node.height;
        callbackOnY(node, reducedHeight + height / 2, this.source);
        this.__reducedHeight__ = reducedHeight + height;
        return this.__reducedHeight__;
    }

    makeLink(callback) {
        return this;
    }

    makeEndpoint() { }

    traverse(callback) {
        callback(this);
    }

    getNodes(jflow) {
        const nodes = [];
        this.traverse((n) => {
            const renderNode = jflow.getRenderNodeBySource(n.source);
            if (renderNode)
                nodes.push(renderNode);
        });
        return nodes;
    }

    getNodeAndLinks(jflow) {
        let linksOrigin = [];
        const nodes = [];
        const links = [];
        this.traverse((n) => {
            const meta = jflow.getSourceRenderMeta(n.source);
            if (meta) {
                nodes.push(meta.jflowNode);
                linksOrigin = linksOrigin.concat(meta.jflowlinks);
            }
        });

        linksOrigin.forEach((l) => {
            if (nodes.includes(l.from) && nodes.includes(l.to)) {
                links.push(l);
            }
        });

        return {
            nodes,
            links,
        };
    }

    getUpperAndBelowLinks(jflow) {
        const meta = jflow.getSourceRenderMeta(this.source);
        // const renderNode = meta.jflowNode;
        const toLink = meta.jflowToLinks.find((l) => l.toDir === DIRECTION.TOP);
        if (this.Endpoint) {
            const metaEndpoint = jflow.getSourceRenderMeta(this.Endpoint.source);

            const belowLink = metaEndpoint.jflowFromLinks.find((l) => l.fromDir === DIRECTION.BOTTOM);
            return {
                upperLink: toLink,
                belowLink,
            };
        }
        let belowLink;
        if (meta.jflowFromLinks.length === 0) {
            belowLink = meta.jflowFromLinks[0];
        } else {
            belowLink = meta.jflowFromLinks.find((l) => l.fromDir === DIRECTION.BOTTOM);
        }
        return {
            upperLink: toLink,
            belowLink,
        };
    }

    getRootNode() {
        let node = this;
        do {
            if (node.parentIterateType === 'playground') {
                return node;
            }
            if (node.parent.isroot) {
                return 'bodyroot';
            }
            node = node.parent;
        } while (node);
    }

    getPrevAndAfterNodes() {
        if (this.Endpoint) {
            return {
                prev: this.prev,
                prevPart: this.prevPart,
                after: this.Endpoint.after,
            };
        }
        return {
            prev: this.prev,
            prevPart: this.prevPart,
            after: this.after,
        };
    }

    linkSource(source, linkMeta, idx, jflow) {
        let targetIdx = this.idx + 1;
        const layoutNode = jflow.getLayoutNodeBySource(source);
        if (layoutNode) {
            if (layoutNode.parent === this.parent && layoutNode.parentIterateType === this.parentIterateType && layoutNode.idx < this.idx) {
                targetIdx = this.idx;
            }
        }
        this.parent.linkSource(source, linkMeta, targetIdx, jflow);
    }

    remove() {
        if (this.parent) {
            const arr = this.parent[this.parentIterateType];
            arr.splice(this.idx, 1);
            arr.forEach((t, i) => {
                t.idx = i;
                if (t.Endpoint) {
                    t.Endpoint.idx = i;
                }
            });

            this.parent = null;
            this.parentIterateType = 'playground';
        }
    }

    linkLayoutNode(layoutNode, linkMeta) {
        const targetIdx = this.idx + 1;
        this.parent.linkLayoutNode(layoutNode, linkMeta, targetIdx);
    }
}

function lineContent(last) {
    return (last?.type === 'WhileStatement' ? 'no' : undefined);
}
class Logic extends BaseNode {
    constructor(source) {
        super(source);
        this.isroot = true;
        this.body = (source.body || []).map(mapFunc('body').bind(this));
        const playgrounditerator = mapFunc('playground').bind(this);
        this.playground = (source.playground || []).map((s, idx) => {
            const n = playgrounditerator(s, idx);
            n.isFree = true;
            return n;
        });
    }

    preprareXCoord(getNodeDimension, syncFakeLink) {
        this.body.forEach((b) => {
            b.preprareXCoord(getNodeDimension, syncFakeLink);
        });
    }

    reflowXCoord(setNodePosition, reduceX) {
        this.body.forEach((b) => {
            b.reflowXCoord(setNodePosition, reduceX);
        });
    }

    reflowYCoord(getNodeDimension, callbackOnY, reducedHeight = 0) {
        this.body.forEach((b, idx) => {
            if (idx > 0) {
                reducedHeight += SPAN_Y;
            }
            reducedHeight = b.reflowYCoord(getNodeDimension, callbackOnY, reducedHeight);
        });
        return reducedHeight;
    }

    makeLink(callback) {
        let last;
        this.body.forEach((b) => {
            if (!last) {
                last = b;
                return;
            }
            callback({
                from: last,
                to: b,
                part: 'body',
                fromDir: DIRECTION.BOTTOM,
                toDir: DIRECTION.TOP,
                rootNode: 'bodyroot',
                content: lineContent(last),
                linkPart: 'body',
            });
            last.after = b;
            b.prev = last;
            b.prevPart = 'body';

            b = b.makeLink((configs) => {
                configs.rootNode = 'bodyroot';
                callback(configs);
            });
            last = b;
        });

        this.playground.forEach((n) => {
            n.makeLink((configs) => {
                configs.rootNode = n;
                callback(configs);
            });
        });
        return this;
    }

    traverse(callback) {
        this.body.forEach((n) => {
            n.traverse(callback);
        });

        this.playground.forEach((n) => {
            n.traverse(callback);
        });
    }

    linkSource(source, linkMeta, idx, jflow) {
        this.source.insertItemInBodyAt(source, idx);
    }

    linkLayoutNode(layoutNode, linkMeta, idx) {
        layoutNode.remove();
        layoutNode.parent = this;
        layoutNode.idx = idx;
        layoutNode.parentIterateType = 'body';
        this.body.splice(idx, 0, layoutNode);
    }
}

class IfStatement extends BaseNode {
    constructor(source) {
        super(source);
        this.consequent = (source.consequent || []).map(mapFunc('consequent').bind(this));
        debugger
        this.alternate = (source.alternate || []).map(mapFunc('alternate').bind(this));
        this.alternateVirtualOccupation = { sequence: 0 };
        this.isLocked = true;
        this.hasEndPoint = true;
    }

    preprareXCoord(getNodeDimension, syncFakeLink) {
        const { width } = getNodeDimension(this.source);
        let consequentWidth = width;
        let alternateWidth = 0;
        let consequentBlockWidth = width / 2;
        this.consequent.forEach((b) => {
            consequentWidth = Math.max(consequentWidth, b.preprareXCoord(getNodeDimension, syncFakeLink));
            consequentBlockWidth = Math.max(consequentBlockWidth, b.__width__ - b.__nodeWidth__ / 2);
        });
        let alternateBlockWidth = 0;
        this.alternate.forEach((b) => {
            alternateWidth = Math.max(alternateWidth, b.preprareXCoord(getNodeDimension, syncFakeLink));
            alternateBlockWidth = Math.max(alternateBlockWidth, b.__width__);
        });
        this.__columns__ = [consequentBlockWidth, alternateWidth];
        this.__nodeWidth__ = width;
        this.__width__ = consequentBlockWidth + SPAN_X + alternateBlockWidth + consequentWidth / 2;
        this.__consquentWidth__ = consequentWidth;
        if (this.__links_empty__[0]) {
            const l = this.__links_empty__[0];
            const minSpanX = consequentBlockWidth - width / 2 + SPAN_X - 10;
            l.minSpanX = minSpanX;
            if (syncFakeLink) {
                syncFakeLink(l, minSpanX);
            }
        }
        return consequentWidth;
    }

    reflowXCoord(setNodePosition, reduceX) {
        setNodePosition(this.source, reduceX);
        const [cw, aw] = this.__columns__;
        // const ch = this.__consquentWidth__ /2 ;
        this.consequent.forEach((b) => {
            b.reflowXCoord(setNodePosition, reduceX);
        });
        this.Endpoint.reflowXCoord(setNodePosition, reduceX);
        this.alternate.forEach((b) => {
            b.reflowXCoord(setNodePosition, reduceX + SPAN_X + cw + aw / 2);
        });
    }

    reflowYCoord(getNodeDimension, callbackOnY, reducedHeight) {
        const node = getNodeDimension(this.source);
        const height = node.height;
        reducedHeight = reducedHeight + height / 2;
        callbackOnY(node, reducedHeight, this.source);
        let reduceA = reducedHeight + height;
        let reduceB = reducedHeight + height / 2;

        this.consequent.forEach((c) => {
            reduceA += SPAN_Y;
            reduceA = c.reflowYCoord(getNodeDimension, callbackOnY, reduceA);
        });
        this.alternate.forEach((a) => {
            reduceB += SPAN_Y;
            reduceB = a.reflowYCoord(getNodeDimension, callbackOnY, reduceB);
        });
        reducedHeight = Math.max(reduceA, reduceB);

        reducedHeight += SPAN_Y;
        reducedHeight = this.Endpoint.reflowYCoord(getNodeDimension, callbackOnY, reducedHeight);
        return reducedHeight;
    }

    getConsequentPart() {
        return `consequent-${this.id}`;
    }

    getAlternatePart() {
        return `alternate-${this.id}`;
    }

    makeLink(callback) {
        let lastc;
        const consequentPart = this.getConsequentPart();
        const alternatePart = this.getAlternatePart();
        this.consequent.forEach((c) => {
            callback({
                from: lastc || this,
                to: c,
                part: consequentPart,
                fromDir: DIRECTION.BOTTOM,
                toDir: DIRECTION.TOP,
                content: lastc ? lineContent(lastc) : 'yes',
                linkPart: 'consequent',
            });
            if (lastc) {
                lastc.after = c;
            }
            c.prev = lastc || this;
            c.prevPart = consequentPart;

            c = c.makeLink(callback);
            lastc = c;
        });

        if (lastc) {
            lastc.after = this.Endpoint;
        }
        callback({
            from: lastc || this,
            to: this.Endpoint,
            bendLast: false,
            fromDir: DIRECTION.BOTTOM,
            toDir: DIRECTION.TOP,
            part: consequentPart,
            content: lastc ? lineContent(lastc) : 'yes',
            noArrow: true,
            linkPart: 'consequent',
        });

        let lasta;
        this.alternate.forEach((a, idx) => {
            const _l = {
                from: lasta || this,
                to: a,
                fromDir: !lasta ? DIRECTION.RIGHT : DIRECTION.BOTTOM,
                toDir: DIRECTION.TOP,
                minSpanX: 0,
                part: alternatePart,
                content: lasta ? lineContent(lasta) : 'no',
                linkPart: 'alternate',
            };
            callback(_l);
            if (idx === 0) {
                this.__links_empty__.push(_l);
            }
            if (lasta) {
                lasta.after = a;
            }
            a.prev = lasta || this;
            a.prevPart = alternatePart;
            a = a.makeLink(callback);
            lasta = a;
        });

        if (lasta) {
            lasta.after = this.Endpoint;
        }
        const _l = {
            from: lasta || this,
            to: this.Endpoint,
            bendLast: false,
            fromDir: !lasta ? DIRECTION.RIGHT : DIRECTION.BOTTOM,
            toDir: DIRECTION.RIGHT,
            part: alternatePart,
            beginsequence: this.sequence,
            presequence: !lasta ? this.alternateVirtualOccupation.sequence : undefined,
            minSpanX: 0,
            content: lasta ? lineContent(lasta) : 'no',
            linkPart: 'alternate',
        };
        callback(_l);
        if (this.alternate.length === 0) {
            this.__links_empty__.push(_l);
        }

        return this.Endpoint;
    }

    traverse(callback) {
        callback(this);
        this.consequent.forEach((n) => {
            n.traverse(callback);
        });
        this.alternate.forEach((n) => {
            n.traverse(callback);
        });
        callback(this.Endpoint);
    }

    linkSource(source, linkMeta, idx = 0, jflow) {
        const consequentPart = this.getConsequentPart();
        const alternatePart = this.getAlternatePart();
        if (linkMeta.part === consequentPart) {
            this.source.insertItemInConsequentAt(source, idx);
        }
        if (linkMeta.part === alternatePart) {
            this.source.insertItemInAlternateAt(source, idx);
        }
    }

    linkLayoutNode(layoutNode, linkMeta, idx) {
        layoutNode.remove();
        const consequentPart = this.getConsequentPart();
        const alternatePart = this.getAlternatePart();
        if (linkMeta.part === consequentPart) {
            this.consequent.splice(idx, 0, layoutNode);
            layoutNode.parentIterateType = 'consequent';
        }
        if (linkMeta.part === alternatePart) {
            this.alternate.splice(idx, 0, layoutNode);
            layoutNode.parentIterateType = 'alternate';
        }
        layoutNode.parent = this;
        layoutNode.idx = idx;
    }
}

class WhileStatement extends BaseNode {
    constructor(source) {
        super(source);
        this.body = (source.body || []).map(mapFunc('body').bind(this));
        this.alternateVirtualOccupation = { sequence: 0 };
        this.isLocked = true;
    }
    preprareXCoord(getNodeDimension, syncFakeLink) {
        const { width } = getNodeDimension(this.source);
        let bodyWidth = 0;
        let bodyBlockWidth = 0;
        this.body.forEach((b) => {
            bodyWidth = Math.max(bodyWidth, b.preprareXCoord(getNodeDimension, syncFakeLink));
            bodyBlockWidth = Math.max(bodyBlockWidth, b.__width__);
        });
        this.__columns__ = [width, bodyWidth];
        this.__nodeWidth__ = width;
        // this.__bodyColumnWidth__ = bodyWidth;
        this.__width__ = width + SPAN_X + bodyBlockWidth;
        if (this.__links_empty__[0]) {
            // this.__links_empty__[0].minSpanX = SPAN_X - 10;
            const l = this.__links_empty__[0];
            const minSpanX = SPAN_X - 10;
            l.minSpanX = minSpanX;
            if (syncFakeLink) {
                syncFakeLink(l, minSpanX);
            }
        }
        return width;
    }

    reflowXCoord(setNodePosition, reduceX) {
        // const q = reduceX + currWidth/2;
        setNodePosition(this.source, reduceX);
        const [width, bodyWidth] = this.__columns__;
        this.body.forEach((b) => {
            b.reflowXCoord(setNodePosition, reduceX + SPAN_X + width / 2 + bodyWidth / 2);
        });
    }
    
    traverse(callback) {
        callback(this);
        this.body.forEach((n) => {
            n.traverse(callback);
        });
    }

    getPartName() {
        return `whilebody-${this.id}`;
    }
    reflowYCoord(getNodeDimension, callbackOnY, reducedHeight) {
        const node = getNodeDimension(this.source);
        const height = node.height;
        callbackOnY(node, reducedHeight + height / 2, this.source);
        reducedHeight += (height / 2);
        const reducerSelf = reducedHeight + height;
        this.body.forEach((c) => {
            reducedHeight += SPAN_Y;
            reducedHeight = c.reflowYCoord(getNodeDimension, callbackOnY, reducedHeight);
        });
        return Math.max(reducerSelf, reducedHeight);
    }
    makeLink(callback) {
        let last;
        const part = this.getPartName();
        // const lastIdx = this.body.length - 1;
        this.body.forEach((b, idx) => {
            const _l = {
                from: last || this,
                to: b,
                part,
                fromDir: !last ? DIRECTION.RIGHT : DIRECTION.BOTTOM,
                toDir: DIRECTION.TOP,
                minSpanX: 0,
                content: last ? lineContent(last) : 'yes',
                linkPart: 'body',
            };
            callback(_l);
            if (idx === 0) {
                this.__links_empty__.push(_l);
            }
            if (last) {
                last.after = b;
            }
            b.prev = last || this;
            b.prevPart = part;
            b = b.makeLink(callback);
            last = b;
        });
        if (last) {
            last.after = this;
        }
        const _l = {
            from: last || this,
            to: this,
            part,
            fromDir: !last ? DIRECTION.RIGHT : DIRECTION.BOTTOM,
            toDir: DIRECTION.BOTTOM,
            isSelf: true,
            beginsequence: this.sequence,
            presequence: !last ? this.alternateVirtualOccupation.sequence : undefined,
            minSpanX: 0,
            minSpanY: 50,
            content: last ? lineContent(last) : 'yes',
            linkPart: 'body',
        };
        callback(_l);
        if (this.body.length === 0) {
            this.__links_empty__.push(_l);
        }
        return this;
    }
}



const TYPE_MAPPING = {
    IfStatement,
    WhileStatement,
    Root: Logic,
    other: BaseNode,
};

function mapFunc(type) {
    return function (n, idx) {
        const p = makeAST(n);
        // p.rootNode = this?.rootNode || this;
        p.parent = this;
        p.idx = idx;
        p.parentIterateType = type;

        // 重要！！！ weakMap 功能需要 endPoint source 保持一致
        if (p.hasEndPoint) {
            if (!n.__endpoint__) {
                n.__endpoint__ = {
                    concept: 'endpoint',
                    id: `${p.id}-endpoint`,
                    getAncestor(concept) {
                        return concept === n.concept ? n : n.getAncestor(concept);
                    }
                };
            }
            const e = makeAST(n.__endpoint__);
            e.parent = this;
            e.idx = idx;
            e.parentIterateType = type;
            p.Endpoint = e;
        }
        return p;
    };
}
function makeAST(source) {
    const type = source.type;
    const Constructor = TYPE_MAPPING[type] || TYPE_MAPPING.other;
    const node = new Constructor(source);
    return node;
}
export {
    makeAST,
};

