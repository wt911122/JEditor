import JEditor from '../src/core/editor';
import { NaslLanguage, translateRoot } from './language';
import '../src/core/style/style.css';
import './style.css';
import source from './source2.json';
import { make } from './model';
import LanguageContext, {resolveContextMeta} from '../src/core/language/language-context';
const model = make(source);
const meta = translateRoot(model);
console.log(meta)
console.log(model)

// function translateCompletion(completion) {
//     const context = new LanguageContext();
//     completion.traverse(context);
//     context._contextRoot = context._currentTarget.elements[0];
//     return context;
// }
// const c = translateCompletion(make({
//     concept: 'CallFunction',
//     name: 'tangle',
//     arguments: [
//         {
//             concept: 'Argument',
//             name: 'param',
//             expression: {
//                 concept: 'NumberLiteral',
//                 value: '',
//             }
//         }
//     ]
// }));


const editorWrapper = document.getElementById('editor');
const editor = new JEditor({
    language: NaslLanguage,
});
editor.$mount(editorWrapper, meta);
// console.log(resolveContextMeta(c, editor))
