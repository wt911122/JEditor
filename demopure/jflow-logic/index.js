import Vue from 'vue'
import { JFlowVuePlugin } from '@joskii/jflow';
import App from './App.vue'
import atomNode from './components/atom';
import LogicSeqWrapper from './components/custom/logic-sequence-wrapper'; 
import IfGroup from './components/custom/ifwrap-group';
import WhileGroup from './components/custom/whilewrap-group';
import InputSlot from './components/custom/input-slot';
import InputGroup from './components/custom/input-group';

Vue.config.productionTip = false;
// Vue.config.parsePlatformTagName = (name) => {
//     if(name === 'math') {
//         return 'nosense'
//     }
//     return name
// }
Vue.use(JFlowVuePlugin, {
    customInstance: {
        InputSlot,
    },
    customGroups: {
        LogicSeqWrapper,
        IfGroup,
        WhileGroup,
        InputGroup
    },
});
Vue.component('j-logic-atom-node', atomNode);

export default function (dom) {
    new Vue({
        render: h => h(App),
    }).$mount(dom)
}