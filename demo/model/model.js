
class Base {
    concept = '';
    constructor(source) {
        this.concept = source.concept;
    }
    traverse(enter, callback, leave) {
        enter(this);
        callback(this);
        leave(this);
    }
}

class BinaryExpression extends Base {
    left = null
    right = null
    operator = ''
    constructor(source) {
        super(source);
        this.operator = source.operator;
        this.left = make(source.left);
        this.right = make(source.right)
    }

    traverse(enter, callback, leave) {
        enter(this);
        this.left.traverse(enter, callback, leave);
        callback(this);
        this.right.traverse(enter, callback, leave);
        leave(this);
    }

    toCode() {
        return this.operator;
    }
}

class Identifier extends Base {
    name = ''
    constructor(source) {
        super(source);
        this.name = source.name;
    }
    toCode() {
        return this.name;
    }
}
class CallFunction extends Base {
    name = ''
    arguments = []
    constructor(source) {
        super(source);
        this.name = source.name;
        this.arguments = source.arguments.map(make);
    }
    traverse(enter, callback, leave) {
        enter(this);
        this.arguments.forEach(arg => {
            arg.traverse(enter, callback, leave);
        })
        leave(this);
    }
}
class Argument extends Base {
    name = ''
    expression = null
    constructor(source) {
        super(source);
        this.name = source.name;
        if(source.expression) {
            this.expression = make(source.expression)
        }
        // this.expression = new Base({});
        
    }

    traverse(enter, callback, leave) {
        enter(this);
        if(this.expression) {
            this.expression.traverse(enter, callback, leave);
        }
        
        leave(this);
    }
}
class NumberLiteral extends Base {
    value = ''
    constructor(source) {
        super(source);
        this.value = source.value
    }

    toCode() {
        return this.value;
    }
}
const Ctors = {
    BinaryExpression,
    Identifier,
    CallFunction,
    Argument,
    NumberLiteral,
    Literal: NumberLiteral,
}

export function make(source) {
    return new Ctors[source.concept || source.type](source);
}


