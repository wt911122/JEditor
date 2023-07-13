import identifierliteral from './atom/identifier.vue';
import binaryExp from './atom/binary.vue';
import callFunction from './callFunction.vue';

function getComponent(type) {
    switch (type) {
        case 'Identifier':
        case 'MemberExpression':
        case 'NumberLiteral':
            return identifierliteral;
        case 'BinaryExpression':
        case 'LogicalExpression':
            return binaryExp;
        case 'CallFunction':
            return callFunction;
    }
}
export default {
    name: 'j-atom-node',
    functional: true,
    props: {
        node: Object,
    },
    render(c, context) {
        const { node } = context.props;
        // const key = context.data.key;
        const targetComponent = getComponent(node?.type, node);
        if (!targetComponent) {
            return null;
        }
        return c(targetComponent, {
            key: node.id,
            props: context.props,
        });
    },
};
