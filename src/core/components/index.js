import { 
    INSTANCE_TYPE,
    JEDITOR_CONTENT,
    JEDITOR_CONTAINER,
    JEDITOR_ERROR_RANGE
} from '../constants';
customElements.define(INSTANCE_TYPE.EDIT_AREA, class extends HTMLParagraphElement {}, { extends: 'p' })
customElements.define(INSTANCE_TYPE.LINE, class extends HTMLParagraphElement {}, { extends: 'p' })
customElements.define(INSTANCE_TYPE.TEXT_ELEMENT, class extends HTMLPreElement {}, { extends: 'pre' })
customElements.define(INSTANCE_TYPE.COMPOSITE, class extends HTMLDivElement {} , { extends: 'div'});
customElements.define(JEDITOR_CONTAINER, class extends HTMLDivElement {} , { extends: 'div'})
customElements.define(JEDITOR_CONTENT, class extends HTMLDivElement {} , { extends: 'div'})

customElements.define(JEDITOR_ERROR_RANGE, class extends HTMLDivElement {} , { extends: 'div'})

// customElements.define(INSTANCE_TYPE.EDIT_AREA, class extends HTMLElement {
//     constructor() {
//         super();
//         this.attachShadow({mode: 'closed'}).innerHTML = `
//             <style>
//                 .root{
//                     display: flex;
//                     flex-direction: column;
//                     align-items: flex-start;
//                 }
//             </style>
//             <div class="root"><slot></slot></div>
//         `;
//     } 
// });

// customElements.define(INSTANCE_TYPE.LINE, class extends HTMLElement {
//     constructor() {
//         super();
//         this.attachShadow({mode: 'closed'}).innerHTML = `
//             <style>
//                 .root{
//                     display: block;
//                     white-space: no-wrap;
//                 }
//             </style>
//             <div class="root"><slot></slot></div>
//         `;
//     } 
// });

// customElements.define(INSTANCE_TYPE.TEXT_ELEMENT, class extends HTMLElement {
//     constructor() {
//         super();
//         this.attachShadow({mode: 'closed'}).innerHTML = `
//         <style>
//             .root {
//                 display: inline-block;
//                 min-width: 0.3em;
//                 line-height: 1.2;
//                 white-space: nowrap;
//                 min-height: 1em;
//             }
//         </style>
//         <span class="root"><slot></slot></span>
//     `;
//     } 
// });

// customElements.define(INSTANCE_TYPE.COMPOSITE, class extends HTMLElement {
//     constructor() {
//         super();
//         this.attachShadow({mode: 'closed'}).innerHTML = `
//             <style>
//                 .root{
//                     display: inline-block;
//                 }
//             </style>
//             <div class="root"><slot></slot></div>
//         `;
//     } 
// });

// customElements.define(JEDITOR_CONTENT, class extends HTMLElement{
//     constructor() {
//         super();
//         this.attachShadow({mode: 'open'}).innerHTML = `
//             <style>
//                 .root {
//                     display: block;
//                     font-family: 'Monaco';
//                     font-weight: normal;
//                     font-size: 14px;
//                     cursor: text;
//                 }
//             </style>
//             <div class="root"><slot></slot></div>
//         `;
//     } 
// })

// customElements.define(JEDITOR_CONTAINER, class extends HTMLElement{
//     constructor() {
//         super();
//         this.attachShadow({mode: 'open'}).innerHTML = `
//             <style>
//                 .root {
//                     display: block;
//                     height: 100%;
//                     width: 100%;
//                     overflow: scroll;
//                     border: 2px solid yellowgreen;
//                     box-sizing: border-box;
//                 }
//             </style>
//             <div class="root"><slot></slot></div>
//         `;
//     } 
// }) 

