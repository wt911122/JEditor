import Vue from 'vue'
import App from './App.vue'
import { JEditorVuePlugin } from '../index';

Vue.config.productionTip = false
Vue.use(JEditorVuePlugin);
new Vue({
  render: h => h(App),
}).$mount('#app')
