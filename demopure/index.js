import JEditor from '../src/core/editor';
import { NaslLanguage } from './language';
import '../src/core/style/style.css';
import './style.css';
import source from './source2.json';
import { make } from './model';
const model = make(source);
const meta = NaslLanguage.translate(model);
console.log(meta)
console.log(model)

const editorWrapper = document.getElementById('editor');
const editor = new JEditor({
    language: NaslLanguage,
});
editor.$mount(editorWrapper, meta);
