<template>
    <j-logic-seq-wrapper :source="node"
        :configs="rootConfig">
        <j-group :configs="headerConfigs">
            <j-text
                :configs="{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textColor: '#333333',
                    content: '内置函数'
                }"></j-text>
            <j-text
                :configs="{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textColor: '#333333',
                    content: node.name
                }"></j-text>
        </j-group>
        <j-group
            :configs="bodyConfigs">
            <j-group v-for="(argu, idx) in node.arguments"
                :key="argu.id"
                :configs="paramsConfigs">
                <j-text :configs="{
                    fontSize: '12px',
                    textColor: '#333',
                    content: argu.name,
                }"></j-text>
                <j-text :configs="{
                    fontSize: '12px',
                    textColor: '#333',
                    content: '=',
                }"></j-text>
                <j-group>
                    <j-logic-atom-node
                        v-if="argu.expression"
                        :node="argu.expression">
                    </j-logic-atom-node>
                    <expression-slot
                        v-else
                        :node="argu"
                        :slot-config="{
                            width: 64,
                            height: 32,
                            borderWidth: 1,
                            backgroundColor: 'rgba(51, 136, 255, 0.1)'
                        }">
                    </expression-slot>
                </j-group>
            </j-group>
        </j-group>
    </j-logic-seq-wrapper>

</template>

<script>
import { LinearLayout } from '@joskii/jflow';
import { CALL_BLOCK_STYLE, ROOT_STYLE } from './style';
import expressionSlot from './slot/expression-slot.vue';
export default {
    components: {
        'expression-slot': expressionSlot,
    },
    props: {
        node: Object,
    },
    data() {
        return {
            rootConfig: {
                indicatorColor: '#F56CC7',
                ...CALL_BLOCK_STYLE.ROOT,
                ...ROOT_STYLE(),
            },
            bodyConfigs: CALL_BLOCK_STYLE.BODY,
            paramsConfigs: CALL_BLOCK_STYLE.PARAM,
        }
    },
    computed: {
        headerConfigs() {
            return CALL_BLOCK_STYLE.HEADER();
        },
    }
}
</script>

<style>

</style>