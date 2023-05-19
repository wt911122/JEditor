import { astWalker } from './utils';

/**
 * sourceMap
 *  {
 *      start,
 *      end,
 *      path
 *      type,
 *  }[]
 */

export class Structure {
    index = undefined;
    parser = undefined;
    freeCodes = [];
    _parent = undefined;

    constructor(index, parser) {
        this.index = index;
        this.parser = parser;
    }

    appendFreeCode(c) {
        this.freeCodes.push(c)
        c._parent = this;
    }

    parse(codeparser) {
        return this.parser((idx) => {
            return this.freeCodes[idx].parse(codeparser)
        })
    }
}

const SOURCE_TYPE = {
    TEXT: 'TEXT',
    STRUCTURE: 'STRUCTURE',
}

export class FreeCode {
    source = '';
    compositesCounter = 0;
    sourceMap = [];
    composites = [];
    structures = [];
    _parent = undefined;

    appendCode(source, path) {
        const start = this.source.length;
        this.source += source;
        this.sourceMap.push({
            start,
            end: start + source.length,
            path,
            type: SOURCE_TYPE.TEXT
        });
    }

    appendComposite(composite, path) {
        const t = ` @{${this.compositesCounter}} `;
        const start = this.source.length;
        this.source += t;
        this.compositesCounter++;
        this.sourceMap.push({
            start,
            end: start + t.length,
            path,
            type: SOURCE_TYPE.STRUCTURE
        });
        this.composites.push(composite);
    }

    resolveStrucuture() {
        this.composites.forEach((composite, idx) => {
            const structure = composite.prepareParse(idx);
            structure._parent = this;
            this.structures.push(structure);
        });
    }
    
    parse(codeparser) {
        try {
            const result = codeparser(this.source);
            astWalker(result, (obj, currparent, currkey) => {
                if(obj.type === "Composite") {
                    const struct = this.structures[obj.id];
                    if(struct) {
                        currparent[currkey] = struct.parse(codeparser);
                    }
                } else if(typeof obj === 'object') {
                    return true;
                }
            });
            return result;
        } catch(err) {
            const { start, end } = err.location;
            console.log(start, end)
            const r = [start.offset, end.offset];
            console.log(r);
        }
    }
}