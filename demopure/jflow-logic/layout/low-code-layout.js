import { makeAST } from './basenode';

function sqr(x) {
    return x * x;
}
function dist2(v, w) {
    return sqr(v[0] - w[0]) + sqr(v[1] - w[1]);
}
// function easeInQuad(elapsed, initialValue, amountOfChange, duration) {
// 	return amountOfChange * (elapsed /= duration) * elapsed + initialValue;
// }

function setX(instance, x) {
    instance.setAnchorX(x);
}
function setY(instance, y) {
    instance.setAnchorY(y);
}
function noop() { }

let makeASTFunc = makeAST;

/**
 * @typedef {Object} LowcodeLayout~Configs
 * @property {number} linkLength - 最小连线长度
 * @property {number} gap       - 列间隙
 * @property {boolean} treeItemDraggable - 树上的是否可以拖动
 * @property {Object} ast       - 语法树
 */

/**
    lowcode layout

    type:
        + IfStatement,
        + SwitchStatement,
        + SwitchCase,
        + ForEachStatement,
        + WhileStatement,
        + Root,
        + other,

    * @implements {Layout}
    * @param {LowcodeLayout~Configs} - 配置

 */
class LowcodeLayout {
    constructor(configs) {
        /** @member {number}      - 最小连线长度 */
        this.linkLength = configs.linkLength || 18;
        /** @member {number}      - 列间隙 */
        this.gap = configs.gap || 30;
        /** @member {boolean}      - 树上的是否可以拖动 */
        this.treeItemDraggable = configs.treeItemDraggable ?? true;
        this.reOrder(configs.ast);
        /** @member {boolean}      - true 需要检查元素拖动 */
        // this.static = true;
        this.source_ElementPos_Map = new WeakMap();

        // this.rootNodeFlowLinkWeakMap = new WeakMap();
    }

    /**
     * 从 ast 计算布局
     * @param {AstNode} ast - ASL 树
     */
    reOrder(ast) {
        this.ast = ast;
        this.flowStack = [];
        this.flowLinkStack = [];
        this.playgroundStack = [];
        this.root = makeASTFunc(this.ast);// new AstNode(this.ast, this.flowStack, true);
        this.root.traverse((node) => {
            this.flowStack.push({
                type: node.type,
                source: node.source,
                layoutNode: node,
            });
        });
        let linkIds = [];
        this.root.makeLink((configs) => {
            const key = `${configs.from.source.id}-${configs.to.source.id}-${configs.part}`
            if(!linkIds.includes(key)) {
                this.flowLinkStack.push(configs);
                linkIds.push(key)
            }
        });
    }


    reflowByMapping(jflow, x, y, callbackOnX, callbackOnY, rootNode, syncFakeLink) {
        const reduceWidth = x;
        let reduceHeight = y;
        let _rootNode = rootNode;
        const opacity = _rootNode === 'bodyroot' ? 1 : 0.6;
        if (_rootNode === 'bodyroot') {
            _rootNode = this.root;
        }
        const instance = jflow.getRenderNodeBySource(_rootNode.source);
        if (instance) {
            const dimension = instance.getBoundingDimension();
            reduceHeight -= dimension.height / 2;
        }

        _rootNode.reflowYCoord((source) => jflow.getRenderNodeBySource(source), callbackOnY, reduceHeight);

        _rootNode.preprareXCoord((source) => jflow.getRenderNodeBySource(source), syncFakeLink);
        _rootNode.reflowXCoord((source, x, shift) => {
            const instance = jflow.getRenderNodeBySource(source);
            instance.linkShiftX = shift;
            callbackOnX(instance, x, source);
            instance.opacity = opacity;
            return instance;
        }, reduceWidth);
    }

    reflow(jflow) {
        this.reflowByMapping(jflow, 0, 0, setX, setY, 'bodyroot');
        this.root.playground.forEach((node) => {
            const anchor = [node.source.offsetX || 0, node.source.offsetY || 0];
            this.reflowByMapping(jflow, anchor[0], anchor[1], setX, setY, node);
        });
    }
}

export default LowcodeLayout;
