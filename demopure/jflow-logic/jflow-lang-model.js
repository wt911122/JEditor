import { v4 as uuidv4 } from 'uuid';

class Base {
    concept = '';
    id = '';
    constructor(source) {
        this.id = uuidv4();
        this.type = source.concept || source.type;
    }
    toCode() {
        return ''
    }
}



export class BinaryExpression extends Base {
    left = null
    right = null
    operator = ''
    constructor(source) {
        super(source);
        this.operator = source.operator;
        this.left = make(source.left);
        this.right = make(source.right)
    }

    toCode() {
        return this.operator;
    }
}
export class LogicalExpression extends BinaryExpression {
}

export class Identifier extends Base {
    name = ''
    constructor(source) {
        super(source);
        this.name = source.name;
    }
    toCode() {
        return this.name;
    }
}
export class NumberLiteral extends Base {
    value = ''
    constructor(source) {
        super(source);
        this.value = source.value
    }

    toCode() {
        return this.value;
    }
}

export class MemberExpression extends Base {
    object = undefined;
    property = undefined;
    constructor(source) {
        super(source);
        this.object = make(source.object);
        this.property = make(source.property);
    }

    toCode() {
        return this.object.toCode() + '.' + this.property.toCode();
    }
}
export class CallFunction extends Base {
    name = ''
    arguments = []
    constructor(source) {
        super(source);
        this.name = source.name;
        this.arguments = source.arguments.map(make);
    }
}

export class Argument extends Base {
    name = ''
    expression = null
    constructor(source) {
        super(source);
        this.name = source.name;
        if(source.expression) {
            this.expression = make(source.expression)
        }
    }
}

export class IfStatement extends Base {
    test = null
    consequent = []
    alternate = []
    constructor(source) {
        super(source);
        if(source.test) {
            this.test = make(source.test);
        }
        this.consequent = source.consequent.map(make);
        this.alternate = source.alternate.map(make);
    }
}

export class Assignment extends Base {
    left = undefined
    right = undefined
    constructor(source) {
        super(source);
        if(source.left) {
            this.left = make(source.left);
        }
        if(source.right) {
            this.right = make(source.right);
        }
    }
}

export class WhileStatement extends Base {
    test = null;
    body = [];
    constructor(source) {
        super(source);
        if(source.test) {
            this.test = make(source.test);
        }
        this.body = source.body.map(make);
    }
}

export class Logic extends Base {
    body = []
    constructor(source) {
        super(source);
        this.type = 'Root'
        this.body = source.body.map(make);
    }
}

const Ctors = {
    Logic,
    Assignment,
    IfStatement,
    WhileStatement,
    BinaryExpression,
    LogicalExpression,
    MemberExpression,
    Identifier,
    CallFunction,
    Argument,
    NumberLiteral,
}

export function make(source) {
    const c = Ctors[source.concept || source.type]
    if(c) {
        return new c(source);
    }
    return new Base(source)
}


