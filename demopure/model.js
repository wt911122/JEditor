class Base {
    concept = '';
    constructor(source) {
        this.concept = source.concept;
    }
    traverse(context) {
        context.addElement(context.createTextElementMeta(this.toCode()));
    }
    toCode() {
        return ''
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

    traverse(context) {
        context.addElement(context.createTextElementMeta('('));
        this.left.traverse(context);
        context.addElement(context.createTextElementMeta(this.toCode()));
        this.right.traverse(context);
        context.addElement(context.createTextElementMeta(')'));
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
class CallFunction extends Base {
    name = ''
    arguments = []
    constructor(source) {
        super(source);
        this.name = source.name;
        this.arguments = source.arguments.map(make);
    }
    traverse(context) {
        context.addElement(context.createCompositeMeta(this, this.concept));
        context.save();
        this.arguments.forEach(arg => {
            arg.traverse(context);
        })
        context.restore();
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
    }

    traverse(context) {
        context.addElement(context.createEditAreaMeta(this));
        context.save();
        if(this.expression) {
            this.expression.traverse(context);
        }
        context.restore();
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


