<template>
    <j-if-group
        ref="root"
        :source="node"
        :configs="groupConfig">
        <j-text :configs="{
            fontSize: '12px',
            fontWeight: 'bold',
            textColor: '#333',
            content: '是否满足条件',
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
                parent-attr="setTest"
                :slot-config="{
                    side: 2,
                    width: 64,
                    height: 32,
                    backgroundColor: 'rgba(51, 136, 255, 0.1)',
                }">
            </expression-slot>
        </j-group>
    </j-if-group>
</template>

<script>
import { LinearLayout, Group } from '@joskii/jflow';
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
const hLayout = new LinearLayout({
    direction: 'horizontal',
    gap: 2,
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
            shrinkConfigWrapper: {
                layout: verticalLayout,
                marginTop: 30,
                paddingBottom: 10,
            },
            logicIconConfig: {
                width: 32,
                height: 32,
            },
            shrink: false,
            isDragOver: false,

            leftIconVisible: false,
            rightIconVisible: false,
        };
    },
    computed: {
      
        groupConfig() {
            return {
                layout: rootLayout,
                backgroundColor: '#fff',
                padding: 8,
                borderRadius: 5,
                surface: true,
                ...ROOT_STYLE({
                    isHover: this.isHover,
                    isFocus: this.isFocus,
                    isError: this.isError || this.hasSubError,
                    isWarning: this.isWarning,
                    isDragOver: this.isDragOver,
                }),
                // ...shadow,
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
