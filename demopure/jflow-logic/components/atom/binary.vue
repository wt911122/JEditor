<template>
    <j-group ref="root"
        :source="node"
        :configs="rootConfigs">
        <j-group>
            <j-logic-atom-node
                v-if="node.left"
                :node="node.left">
            </j-logic-atom-node>
            <expression-slot
                v-else
                :node="node"
                :slot-config="{
                    width: 32,
                    height: 24,
                    backgroundColor: '#fff'
                }">
            </expression-slot>
        </j-group>
        <j-text :configs="{
            fontSize: '12px',
            textColor: '#0055CC',
            fontFamily: 'PingFang SC',
            content: node.operator,
        }">
        </j-text>
        <j-group>
            <j-logic-atom-node
                v-if="node.right"
                :node="node.right">
            </j-logic-atom-node>
            <expression-slot
                v-else
                :node="node"
                :slot-config="{
                    width: 32,
                    height: 24,
                    backgroundColor: '#fff'
                }">
            </expression-slot>
        </j-group>
    </j-group>
</template>

<script>
import { LinearLayout } from '@joskii/jflow';
import { EXPRESSION_STYLE } from '../style';
import expressionSlot from '../slot/expression-slot.vue';
/*
 * 二元表达式 —— 算数运算
 */
export default {
    components: {
        'expression-slot': expressionSlot,
    },
    inject: ['renderJFlow'],
    props: {
        node: Object,
        disabled: {
            type: Boolean,
            default: false,
        },
        isFocus: Boolean,
        folded: Boolean,
    },
    data() {
        return {
            rootLayout: new LinearLayout({
                direction: 'horizontal',
                gap: 2,
            }),
        };
    },
    computed: {
        rootConfigs() {
            return {
                layout: this.rootLayout,
                ...EXPRESSION_STYLE({
                    opacity: this.opacity,
                    isFull: this.isFull
                }),
                padding: 4,
                borderRadius: 8,
            };
        },
        isFull() {
            return this.node.left && this.node.right;
        },
        opacity() {
            return 0.2; // getOpacity(this.node);
        },
    },
    updated() {
        this.renderJFlow();
    },
};
</script>

<style>

</style>
