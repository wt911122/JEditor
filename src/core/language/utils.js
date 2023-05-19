export function astWalker(ast, callback) {
    // callback(ast, parent, key);
    Object.keys(ast).forEach(key => {
        const obj = ast[key];
        if(callback(obj, ast, key)){
            astWalker(obj, callback);
        }
    })
}