import JEditor from '../core-html/index';
export default {
    props: {
        configs: Object,
    },
    render: function (createElement) {
        return createElement('div', this.$slots.default);
    },
    created() {
        this._jEditorInstane = new JEditor(this.configs);
        Object.keys(this.$listeners).map(event => {
            const func = this.$listeners[event].bind(this);
            this._jEditorInstane.editorModel.addEventListener(event, func);
        })
    },
    mounted() {
        
        this._jEditorInstane.$mount(this.$el);
        
    },
    beforeDestroy() {
        this._jEditorInstane.destroy();
    },
}