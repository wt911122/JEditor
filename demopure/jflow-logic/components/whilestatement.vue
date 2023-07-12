<template>
    <j-while-group
        :source="node"
        :configs="groupConfig">
        <j-text :configs="{
            fontSize: '12px',
            fontWeight: 'bold',
            textColor: '#333',
            content: '满足条件时循环',
            textAlign: 'center',
        }">
        </j-text>
        <j-group>
            <j-logic-atom-node
                v-if="node.test"
                :node="node.test">
            </j-logic-atom-node>
            <expression-slot
                v-else
                :node="node"
                :slot-config="{
                    side: 2,
                    width: 64,
                    height: 32,
                    backgroundColor: 'rgba(51, 136, 255, 0.1)',
                }">
            </expression-slot>
        </j-group>
    </j-while-group>
</template>

<script>
import { LinearLayout } from '@joskii/jflow';
import expressionSlot from './slot/expression-slot.vue';
import { ROOT_STYLE } from './style';

const verticalLayout = new LinearLayout({
    direction: 'vertical',
});
const rootLayout = new LinearLayout({
    direction: 'vertical',
    gap: 2,
    alignment: 'start',
});
export default {
    components: {
        'expression-slot': expressionSlot,
    },
    inject: ['renderJFlow'],
    props: {
        node: Object,
        isHover: Boolean,
        isFocus: Boolean,
    },
    data() {
        return {
            isDragOver: false,
            shrinkConfigWrapper: {
                layout: verticalLayout,
                marginTop: 30,
                paddingBottom: 10,
            },
            logicIconConfig: {
                width: 32,
                height: 32,
            },
        };
    },
    computed: {
        groupConfig() {
            return {
                layout: rootLayout,
                backgroundColor: '#fff',
                borderRadius: 5,
                padding: 8,
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
