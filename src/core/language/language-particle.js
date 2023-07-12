import { queryInstanceByPath } from '../utils';
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

    appendFreeCode(meta, c) {
        this.freeCodes.push({
            meta,
            code: c,
        })
        c._parent = this;
    }

    parse(codeparser, editor) {
        return this.parser((finder) => {
            const code = finder(this.freeCodes)?.code;
            if(code) {
                return code.parse(codeparser, editor)
            }
            return null;
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
    
    parse(codeparser, editor) {
        try {
            let result = codeparser(this.source);

            const solveSegment = (segment) => {
                if(segment.type === "Composite") {
                    const struct = this.structures[segment.id];
                    if(struct) {
                        return struct.parse(codeparser, editor);
                    }
                } else {
                    astWalker(segment, (obj, currparent, currkey) => {
                        if(obj.type === "Composite") {
                            const struct = this.structures[obj.id];
                            if(struct) {
                                const t = struct.parse(codeparser, editor);
                                if(currparent && currkey) {
                                    currparent[currkey] = t;
                                }
                            }
                        } else if(typeof obj === 'object') {
                            return true;
                        }
                    });
                    return segment;
                }
            }

            if(result.type === "SegmentExpression") {
                result = result.segments.map(s => solveSegment(s));
            } else {
                result = solveSegment(result)
            }
            
            
            return result;
        } catch(err) {
            const { start, end } = err.location;
            const r = [start.offset, end.offset];
            const source = this.sourceMap.filter(m => {
                return m.start <= r[0] && m.end >= r[1];
                // if(m.type === SOURCE_TYPE.TEXT) {
                //     return {
                //         type: 'text',
                //         offset: m.start <= r[0] && m.end >= r[1],
                //     }
                // } else {
                //     return {
                //         type: 'structure',
                //         path: m.path,
                //     }
                // }
            });
            console.log(source)
            source.forEach(s => {
                const type = s.type;
                if(type === "TEXT") {
                    editor.errorDecorator.addDecorator({
                        type: s.type,
                        offset: [
                            r[0]-s.start,
                            r[1]-s.start,
                        ],
                        path: s.path,
                    })
                }

                if(type === "STRUCTURE") {
                    editor.errorDecorator.addDecorator({
                        type: s.type,
                        path: s.path,
                    })
                }
                // instance.decorate([
                //     r[0]-s.start,
                //     Math.min(instance.getLength(), r[1]-s.start)
                // ])
            });
            

            
            return null;
        }
    }
}