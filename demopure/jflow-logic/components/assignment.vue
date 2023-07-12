<template>
    <j-logic-seq-wrapper
        :source="node"
        :configs="groupConfig">
        <j-group :configs="contentConfig">
            <j-logic-atom-node
                v-if="node.left"
                :node="node.left">
            </j-logic-atom-node>
            <expression-slot
                v-else
                :node="node"
                parent-attr="setRight"
                :slot-config="{
                    side: 2,
                    width: 64,
                    height: 32,
                    backgroundColor: 'rgba(51, 136, 255, 0.1)',
                    borderWidth: 1,
                }">
            </expression-slot>
            <j-text :configs="{
                fontSize: '12px',
                textColor: '#536995',
                content: '赋值',
            }"></j-text>
        </j-group>
        <j-group>
            <j-logic-atom-node
                v-if="node.right"
                :node="node.right">
            </j-logic-atom-node>
            <expression-slot
                v-else
                :node="node"
                parent-attr="setRight"
                :slot-config="{
                    side: 2,
                    width: 64,
                    height: 32,
                    backgroundColor: 'rgba(51, 136, 255, 0.1)',
                    borderWidth: 1,
                }">
            </expression-slot>
        </j-group>
    </j-logic-seq-wrapper>
</template>

<script>
import { LinearLayout } from '@joskii/jflow';
import { ROOT_STYLE, CALL_BLOCK_STYLE, HORIZONTAL_LAYOUT, TextAlignTopLayout } from './style';
import expressionSlot from './slot/expression-slot.vue';
const aligntopLayout = new TextAlignTopLayout({
    gap: 4,
});

export default {
    components: {
        'expression-slot': expressionSlot,
    },
    inject: ['renderJFlow'],
    props: {
        node: Object,
    },
    data() {
        console.log(this.node)
        return {
            contentConfig: {
                layout: new LinearLayout({
                    direction: 'horizontal',
                    gap: 5,
                }),
            },
        };
    },
    computed: {
        groupConfig() {
            return {
                indicatorColor: '#EBBC00',
                ...CALL_BLOCK_STYLE.ROOT,
                minWidth: 0,
                layout: aligntopLayout,
                surface: true,
                ...ROOT_STYLE(),
            };
        },
    },
    updated() {
        this.renderJFlow();
    },
};
</script>

<style>

</style>
