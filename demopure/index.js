import JEditor from '../src/core/editor';
import logicDesigner from './jflow-logic/index';
import { NaslLanguage, translateRoot } from './language';
import '../src/core/style/style.css';
import './style.css';
import source from './source3.json';
import { make } from './model';
// import LanguageContext, {resolveContextMeta} from '../src/core/language/language-context';
const model = make(source);
const meta = translateRoot(model);
console.log(meta)
console.log(model)

// const astwrapper = document.getElementById('ast');
logicDesigner('#ast');
const editorWrapper = document.getElementById('editor');
const editor = new JEditor({
    language: NaslLanguage,
    onChange(ast) {
        console.log(ast)
        window.reOrderAndReflow({
            concept: 'Logic',
            body: [
                { concept: 'Start' },
                ...ast,
                { concept: 'End' },
            ]
        })
        // astwrapper.innerHTML = syntaxHighlight(ast);
    }
});
editor.$mount(editorWrapper, meta);
// console.log(resolveContextMeta(c, editor))

function syntaxHighlight(json) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}