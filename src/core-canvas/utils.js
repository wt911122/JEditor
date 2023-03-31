// function makeid(length) {
//     let result = '';
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-*/.';
//     const charactersLength = characters.length;
//     let counter = 0;
//     while (counter < length) {
//       result += characters.charAt(Math.floor(Math.random() * charactersLength));
//       counter += 1;
//     }
//     return result;
// }


// const contents = [];
// let i = 0;
// const lineHeight = 18;
// const lines = 800 / lineHeight;
// while(i < lines) {
//     contents.push(makeid(Math.random() * 50 + 100))
//     i++;
// }


export function getListTail(list) {
    return list[list.length-1];
}
export function getElementIndexInList(element, list) {
    return list.findIndex(el => el === element);
}

