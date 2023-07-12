export function astWalker(ast, callback) {
    // callback(ast);
    Object.keys(ast).forEach(key => {
        if(key !== 'loc'){
            const obj = ast[key];
            if(callback(obj, ast, key)){
                astWalker(obj, callback);
            }
        }
    })
}