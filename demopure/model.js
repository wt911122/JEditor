// import { v4 as uuidv4 } from 'uuid';
function addEmptyText(context) {
    context.addElement(context.createEditLineMeta());
    context.save();
    context.createTextElementMeta()
    context.restore();
}

class Base {
    concept = '';
    // id = '';
    constructor(source) {
        // this.id = uuidv4();
        this.concept = source.concept;
    }
    traverse(context) {
        context.addElement(context.createTextElementMeta(this.toCode()));
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
export class CallFunction extends Base {
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

    traverse(context) {
        context.addElement(context.createEditAreaMeta(this, this.concept));
        context.save();
        context.addElement(context.createEditLineMeta());
        context.save();
        if(this.expression) {
            this.expression.traverse(context);
        }
        context.restore();
        context.restore();
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

    traverse(context) {
        context.addElement(context.createCompositeMeta(this, this.concept));
        context.save();
        context.addElement(context.createEditAreaMeta(this, this.concept, {
            key: 'test'
        }));
        context.save();
        context.addElement(context.createEditLineMeta());
        context.save();
        if(this.test) {
            this.test.traverse(context);
        }
        context.restore(); 
        context.restore();

        context.addElement(context.createEditAreaMeta(this, this.concept, {
            key: 'consequent'
        }));
        context.save();
        if(this.consequent.length === 0) {
            addEmptyText(context);
        } else {
            this.consequent.forEach(c => {
                context.addElement(context.createEditLineMeta());
                context.save();
                c.traverse(context);
                context.restore();
            })
        }
        context.restore();

        context.addElement(context.createEditAreaMeta(this, this.concept, {
            key: 'alternate'
        }));
        context.save();
        if(this.consequent.length === 0) {
            addEmptyText(context);
        } else {
            this.alternate.forEach(a => {
                context.addElement(context.createEditLineMeta());
                context.save();
                a.traverse(context);
                context.restore();
            })
        }
        context.restore();

        context.restore();
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

    traverse(context) {
        context.addElement(context.createCompositeMeta(this, this.concept));
        context.save();

        context.addElement(context.createEditAreaMeta(this, this.concept, {
            key: 'left'
        }));
        context.save();
        context.addElement(context.createEditLineMeta());
        context.save();
        if(this.left) {
            this.left.traverse(context);
        }
        context.restore();
        context.restore();
        
       
        context.addElement(context.createEditAreaMeta(this, this.concept,  {
            key: 'right'
        }));
        context.save();
        context.addElement(context.createEditLineMeta());
        context.save();
        if(this.right) {
            this.right.traverse(context);
        }
        context.restore();
        context.restore();
        
        context.restore();
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

    traverse(context) {
        context.addElement(context.createCompositeMeta(this, this.concept));
        context.save();
        context.addElement(context.createEditAreaMeta(this, this.concept, {
            key: 'test'
        }));
        context.save();
        context.addElement(context.createEditLineMeta());
        context.save();
        if(this.test) {
            this.test.traverse(context);
        }
        context.restore(); 
        context.restore();

        context.addElement(context.createEditAreaMeta(this, this.concept, {
            key: 'body'
        }));
        context.save();
        if(this.body.length === 0) {
            addEmptyText(context);
        } else {
            this.body.forEach(c => {
                context.addElement(context.createEditLineMeta());
                context.save();
                c.traverse(context);
                context.restore();
            })
        }
        context.restore();

        context.restore();
    }

}

export class Logic extends Base {
    body = []
    name = '';
    constructor(source) {
        super(source);
        this.name = source.name;
        this.body = source.body.map(make);
    }

    traverse(context) {
        
        this.body.forEach(arg => {
            context.addElement(context.createEditLineMeta());
            context.save();
            arg.traverse(context);
            context.restore();
        })
        
    }
}

const Ctors = {
    Logic,
    Assignment,
    IfStatement,
    WhileStatement,
    BinaryExpression,
    LogicalExpression,
    Identifier,
    CallFunction,
    Argument,
    NumberLiteral,
    Literal: NumberLiteral,
}

export function make(source) {
    return new Ctors[source.concept || source.type](source);
}


