import '../core-html/style/style.css';
import jEditor from "./jEditor";

const componentPrefix = 'j'
export default {
    install: (Vue, options = {}) => {
        let prefixToUse = componentPrefix;
        if(options && options.prefix){
            prefixToUse = options.prefix;
        };
        Vue.component(`${prefixToUse}Editor`, jEditor);

    }
}