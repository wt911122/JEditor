<template>
    <div>
<div>目前仅支持 sin cos tan pow 函数</div>
<div class="container">
    <div style="width: 600px; height: 600px;border: 1px solid #000; padding: 20px">
        <j-editor style="width: 100%; height: 100%;"
            :configs="configs"
            @parsed="onParsed">
        </j-editor>
    </div>
    <pre v-html="jsonhtml">
    </pre>
</div>
</div>
</template>
<script>
import { make } from './model/model.js';
import { NASLlang } from './model/language.js';
import JEditor from '../src/core-html/index';
const source = {
    concept: 'BinaryExpression',
    operator: '+',
    left: {
        concept: 'BinaryExpression',
        operator: '+',
        left: {
            concept: 'Identifier',
            name: 'x1'
        },
        right: {
            concept: 'Identifier',
            name: 'y1'
        }
    },
    right: {
        concept: 'CallFunction',
        name: 'sin',
        arguments: [
            {
                concept: 'Argument',
                name: 'angle',
                expression: {
                    concept: 'NumberLiteral',
                    value: '20',
                    // concept: 'CallFunction',
                    // name: 'cos',
                    // arguments: [
                    //     {
                    //         concept: 'Argument',
                    //         name: 'angle',
                    //         expression: {
                    //             concept: 'NumberLiteral',
                    //             value: '20',
                    //         }
                    //     }
                    // ]
                }
            }
        ]
    }
}
JEditor.registLanguage('NASL', NASLlang)
// NASL
const root = make(source);
console.log(root)
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
export default {
    data() {
        return {
            configs: {
                source: root,
                lang: 'NASL'
            },
            jsonhtml: ''
        }
    },
    methods: {
        onParsed(event) {
            console.log(event.detail.result)

            this.jsonhtml = syntaxHighlight(event.detail.result)
        }
    }
};
</script>
<style>
.container{
    display: flex;
    flex-direction: row;
}
pre {outline: 1px solid #ccc; padding: 5px; margin: 5px; }
.string { color: green; }
.number { color: darkorange; }
.boolean { color: blue; }
.null { color: magenta; }
.key { color: red; }
</style>