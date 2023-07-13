<template>
    <div style="position: relative;">
        <j-jflow ref="jflow" 
            class="wrapper" 
            :configs="configs"
            :genVueComponentKey="genVueComponentKey">
            <template #Start="{ source }">
                <start :node="source"></start>
            </template>
            <template #End="{ source }">
                <end :node="source"></end>
            </template>
            <template #Assignment="{source}">
                <assignment :node="source"></assignment>
            </template>
            <template #IfStatement="{ source }">
                <if-statement :node="source"></if-statement>
            </template>
            <template #WhileStatement="{ source }">
                <while-comp :node="source"></while-comp>
            </template>
            <template #endpoint="{ source }">
                <j-endpoint :node="source"></j-endpoint>
            </template>

            <template #jflowcommon="{ source }">
                <j-logic-atom-node
                    :node="source">
                </j-logic-atom-node>
            </template>
            
            <template #plainlink="{ configs }">
                <instance-link
                    :linkConfigs="configs">
                </instance-link>
            </template>
        </j-jflow>
    </div>
</template>
<script>
import Lowcodelayout from './layout/low-code-layout.js';
import ifStatement from './components/ifstatement.vue';
import start from './components/start.vue';
import end from './components/end.vue';
import whileComp from './components/whilestatement.vue';
import callFunction from './components/callFunction.vue';
import endpoint from './components/endpoint.vue';
import instanceLink from './components/instance-link.vue';
import Assignment from './components/assignment.vue';
import { make } from './jflow-lang-model';
import { makeAST } from './jflow-base-model'

export default {
    components: {
        start,
        end,
        ifStatement,
        whileComp,
        Assignment,
        callFunction,
        'j-endpoint': endpoint,
        instanceLink
    },
    provide() {
        return {
            renderJFlow: this.renderJFlow,
        }
    },
    data() {
        const source = make({
            concept: 'Logic',
            body: [
                { concept: 'Start' },
                { concept: 'End' },
            ]
        })
        const layout = new Lowcodelayout({
            linkLength: 60,
            ast: source,
        });
        const configs = Object.freeze({
            allowDrop: true,
            layout,
            initialZoom: 1,
            minZoom: .2,
            setInitialPosition(realboxX, realboxY, realboxW, realboxH, c_x, c_y, c_width, c_height) {
                return {
                    x: realboxX + c_width / 2,
                    y: c_y
                }
            }
        })
        // console.log(configs)
        return {
            configs,
        }
    },
    mounted() {
        window.reOrderAndReflow = this.reOrderAndReflow.bind(this);
    },
    methods: {
        renderJFlow() {
            this.$refs.jflow.renderJFlow();
        },
        genVueComponentKey(source){
            return source.id;
        },
        reOrderAndReflow(ast) {
            const source = make(ast);
            this.configs.layout.reOrder(source);
            this.$refs.jflow.reflow();
        },
    }
}
</script>
<style>
.wrapper{
    width: 600px;
    height: 600px;
    border: 1px solid #ccc;
}
</style>