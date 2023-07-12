import { LinearLayout } from '@joskii/jflow';
export class TextAlignTopLayout {
    constructor(configs = {}) {
        this.name = 'TextAlignTopLayout';
        this.lineHeight = 24;
        this.gap = configs.gap || 4;
        this.alignment = configs.alignment || 'center'
    }
    reflow(group) {
        const stack = group._stack.filter((instance) => instance.visible);
        const groupWidth = group.width - group.padding.left - group.padding.right;
        const { lineHeight, gap } = this;
        let reduceWidth = 0;
        let maxHeight = 0;
        const l = stack.length - 1;
        stack.forEach((instance, idx) =>  {
            const { width, height } = instance.getBoundingDimension();
            const g = (idx < l  ? gap : 0);
            reduceWidth += width/2;
            maxHeight = Math.max(height, maxHeight);
            instance.anchor = [reduceWidth, 0]
            reduceWidth += (width/2 + g)
            
        });
        const halfHeight = Math.max(maxHeight, lineHeight) / 2;
        let halfWidth = reduceWidth / 2;
        if(this.alignment === 'left') {
            halfWidth = Math.max(reduceWidth, groupWidth) /2;
        }
        
        stack.forEach((instance) => {
            const { height } = instance.getBoundingDimension();
            const t = Math.max(height, lineHeight) / 2;
            instance.anchor[0] -= halfWidth;
            instance.anchor[1] += t - halfHeight;
        });  
    }

    clone() {
        return new TextAlignTopLayout();
    }
}

const GAP = 20;
let LINE_GAP = 12;
export function setColumnLineGap(val) {
    LINE_GAP = val;
}
export function getColumnLineGap() {
    return LINE_GAP;
}
class ColumnLayout {
    constructor(isIndexed) {
        this.name = 'ColumnLayout';
        this.wrapWidth = 640;
        this.isIndexed = !!isIndexed;
        // this.lineGap = 12
    }
    reflow(group) {
        const stack = group._stack.filter((instance) => instance.visible && instance.display !== 'lineblock');
        const lineblock = group._stack.find(i => i.display === 'lineblock');
        const lineGap = LINE_GAP;
        const groupWidth = group.width - group.padding.left - group.padding.right;
        let maxWidth = 0;
        let _s = stack;
        if(this.isIndexed) {
            _s = stack.slice().sort((a, b) => a.indexed - b.indexed);
        }
        _s.forEach((instance, idx) => {
            const { width, height } = instance.getBoundingDimension();
            maxWidth = Math.max(width, maxWidth);
        });
        const wrapWidth = Math.max(this.wrapWidth, maxWidth);
        const MAX = (wrapWidth - GAP) / 2;

        let c1flag = true;
        const rows = [];
        let row = [];
        let c1Width = 0;
        let c2Width = 0;
        let rowHeight = 0;
        let singleRowWidth = 0;
        let allHeight = 0;
        function reducer() {
            allHeight += rowHeight;
            rows.push({
                row, rowHeight,
            });
            c1flag = true;
            rowHeight = 0;
            row = [];
        }
        _s.forEach((instance) => {
            const { width, height } = instance.getBoundingDimension();

            if (width < MAX) {
                rowHeight = Math.max(rowHeight, height);
                if (c1flag) {
                    row = [];
                    c1Width = Math.max(c1Width, width);
                    c1flag = false;
                }
                row.push(instance);
            } else {
                if (row.length) {
                    reducer();
                }
                rowHeight = Math.max(rowHeight, height);
                singleRowWidth = Math.max(singleRowWidth, width);
                row.push(instance);
                reducer();
            }
            if (row.length === 2) {
                c2Width = Math.max(c2Width, width);
                reducer();
            }
        });
        if (row.length) {
            reducer();
        }
        let allWidth;
        if (rows.length === 1 && rows[0].row.length === 1) {
            allWidth = Math.max(c1Width, singleRowWidth, groupWidth);
        } else {
            allWidth = Math.max(c1Width + c2Width + GAP, singleRowWidth, groupWidth);
        }

        allHeight += lineGap * (rows.length - 1);
        if(lineblock) {
            const h = lineblock.getBoundingDimension().height;
            allHeight += lineGap + h;
            rows.push({
                row: [lineblock],
                rowHeight: h
            })
        }
        const halfHeight = allHeight / 2;
        const halfWidth = allWidth / 2;

        let reducedHeight = 0;
        rows.forEach(({ row, rowHeight }, idx) => {
            // if(idx > 0){
            reducedHeight += rowHeight / 2;
            // }
            if (row.length === 2) {
                const i1 = row[0];
                const i2 = row[1];
                i1.anchor = [
                    i1.width / 2 - halfWidth,
                    reducedHeight - halfHeight + (i1.height - rowHeight) / 2,
                ];
                i2.anchor = [
                    c1Width - halfWidth + GAP + i2.width / 2,
                    reducedHeight - halfHeight + (i2.height - rowHeight) / 2, //+ i2.height / 2,
                ];
            } else {
                const i1 = row[0];
                i1.anchor = [
                    i1.width / 2 - halfWidth,
                    reducedHeight - halfHeight, //+ i1.height / 2,
                ];
            }
            reducedHeight += (rowHeight / 2 + lineGap);
        });
    }

    clone() {
        return new ColumnLayout();
    }
}


const startLayout = {
    reflow(group) {
        const stack = group._stack.filter(instance => instance.visible && !instance.absolutePosition);
        const absoluteStack = group._stack.filter(instance => instance.visible && instance.absolutePosition);
        const groupMinWidth = group.minWidth - group.padding.left - group.padding.right;
        let reduceHeight = 0;
        let lastInstanceHeight = 0;
        let maxWidth = 0;
        let allHeight = 0;
        const childAll = stack.concat(absoluteStack);
        childAll.forEach((instance, idx) =>  {
            if(instance.display === 'block') {
                instance.width = 0;
                // instance.definedWidth = maxWidth;
                instance.resetChildrenPosition();
                instance.reflow();
                instance._getBoundingGroupRect();
            }
        });

        stack.forEach((instance, idx) =>  {
            
            const { width, height } = instance.getBoundingDimension();
            // console.log(height, instance.type);
            const gap = (idx > 0 ? 6 : 0);
            if(instance.display !== 'outstretch') {
                maxWidth = Math.max(width, maxWidth);
            }
            allHeight += (height + gap);
            reduceHeight += (height/2 + gap + lastInstanceHeight)
            lastInstanceHeight = height / 2;
            instance.anchor = [0, reduceHeight];
        });
        childAll.forEach((instance, idx) =>  {
            if(instance.display === 'block') {
                // instance.definedWidth = maxWidth;
                instance.resetChildrenPosition();
                instance.width = maxWidth;
                instance.reflow();
                // instance._getBoundingGroupRect();
            } else if(instance.display === 'outstretch') {
                const w = group._belongs.width - group._belongs.padding.left - group._belongs.padding.right;
                instance.resetChildrenPosition();
                instance.width = Math.max(w, maxWidth);
                instance.reflow();
            }
        });

        allHeight = allHeight/2;
        maxWidth = Math.max(groupMinWidth, maxWidth);
        stack.forEach((instance, idx) =>  {
            const { width } = instance.getBoundingDimension();
            instance.anchor[0] = -(maxWidth - width) / 2;
            instance.anchor[1] -= allHeight;
            // console.log(maxWidth, width, instance.anchor[0])
        })

        if(absoluteStack.length) {
            if(group.display === 'block') {
                group.getBoundingDimension();
            } else {
                group._getBoundingGroupRect();
            }
            const WIDTH = group.width /2;
            const HEIGHT = group.height /2;
            const shifty = (group.padding.top - group.padding.bottom)/2;
            const shiftx = (group.padding.left - group.padding.right)/2;
            absoluteStack.forEach(instance => {
                instance.anchor = _resolveAbsoluteAnchor(instance.absolutePosition, instance, WIDTH, HEIGHT, shiftx, shifty);
            })
        }
    },
    clone() {
        return startLayout;
    }
}

const _h_layout = new LinearLayout({
    direction: 'horizontal',
    gap: 4,
});

export const HORIZONTAL_LAYOUT = new LinearLayout({
    direction: 'horizontal',
    gap: 4,
});
export const ROOT_STYLE = ({
    isHover,
    isFocus,
    isError,
    isWarning,
    isDragOver,
    hideBorder,
} = {}) => {
    if(hideBorder) {
        return {
            borderWidth: 0,
            borderRadius: 0,
        }
    }
    let shadow = {
        shadowColor: 'transparent',
    };
    let borderWidth = 1;
    if (isHover || isFocus) {
        shadow = {
            shadowColor: 'rgba(61, 75, 102, 0.2)',
            shadowBlur: 12,
            shadowOffsetY: 8,
        };
    }
    let borderColor = '#E4E4E6';
    if (isError) {
        borderColor = '#F24957';
        borderWidth = 2;
    } else if (isWarning) {
        borderColor = '#FFAF0F';
        borderWidth = 2;
    } else if (isFocus || isDragOver) {
        borderColor = '#517CFF';
        borderWidth = 2;
    }
    return {
        borderColor,
        borderWidth,
        ...shadow,
    };
};



export const CALL_BLOCK_STYLE = {
    ROOT: {
        layout: startLayout,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 12,
        paddingBottom: 12,
        borderWidth: 1,
        borderRadius: 4,
        backgroundColor: '#fff',
        minWidth: 256,
    },
    SLOT: () => {
        return {
            hideSlot: true,
        }
    },
    HEADER: (titleShift) => ({
        layout: _h_layout,
        height: 24,
        paddingLeft: titleShift ? 14 : 0,
        //display: 'block',
    }),
    BODY: {
        layout: new ColumnLayout(),
        // layout: new LinearLayout({
        //     direction: 'horizontal',
        //     gap: 4,
        // }),
        display: 'block',
    },
    PARAM: {
        layout: new TextAlignTopLayout({
            gap: 4,
        }),
        display: 'block',
    },
    TITLE_LEFT: {
        layout: new TextAlignTopLayout({
            gap: 4,
            alignment: 'left',
        }),
        display: 'block',
    },
};


export const EXPRESSION_STYLE = ({
    isFull,
    isHover,
    isDisabled,
    isError,
    isWarning,
    opacity,
} = {}) => {
    let borderColor = '#0055CC';
    let backgroundColor = `rgba(79, 144, 248, ${opacity})`;
    let borderWidth = 1;
    if (isHover) {
        borderWidth = 2;
    }
    if (isError || !isFull) {
        borderWidth = 2;
        borderColor = '#F24957';
    } else if (isWarning) {
        borderWidth = 2;
        borderColor = '#FFAF0F';
    }
    if (isDisabled) {
        borderWidth = 1;
        backgroundColor = '#E0E0E0';
        borderColor = '#E5E5E5';
    }
    return {
        borderColor,
        backgroundColor,
        borderWidth,
    };
};

export const INPUT_STYLE = ({
    hideMore,
    isInput,
    isHover,
    isError,
    isWarning,
    isDisabled,
} = {}) => {
    let shadow = {
        shadowColor: 'transparent',
    };
    let backgroundColor = '#fff';
    let borderColor = '#0055CC';
    let borderWidth = 1;
    let outlineColor = 'transparent';

    if (isHover) {
        borderWidth = 2;
        if (!hideMore) {
            shadow = {
                shadowColor: 'rgba(61, 75, 102, 0.2)',
                shadowBlur: 12,
                shadowOffsetY: 8,
            };
        }
    }

    if (isInput) {
        borderWidth = 2;
        outlineColor = '#F2F7FE';
    }
    if (isError) {
        borderWidth = 2;
        borderColor = '#F24957';
    } else if (isWarning) {
        borderWidth = 2;
        borderColor = '#FFAF0F';
    }
    if (isDisabled) {
        borderColor = '#E5E5E5';
        backgroundColor = '#F5F5F5';
    }

    return {
        borderColor,
        borderWidth,
        backgroundColor,
        outlineColor,
        ...shadow,
    };
};


export const SLOT_STYLE = ({
    isWhite,
    isError,
    isWarning,
    isActive,
    isDisabled,
} = {}) => {
    let backgroundColor = isWhite ? '#fff' : '#F2F7FE';
    let borderColor = '#CCE0FC';
    let borderWidth = 1;
    let shadow = {
        shadowColor: 'transparent',
    };

    if (isError) {
        borderWidth = 2;
        borderColor = '#F24957';
    } else if (isWarning) {
        borderWidth = 2;
        borderColor = '#FFAF0F';
    }
    if (isActive) {
        borderWidth = 2;
        borderColor = '#0055CC';
        backgroundColor = '#A9CCFE';
        shadow = {
            shadowColor: 'rgba(0, 106, 255, 0.6);',
            shadowBlur: 6,
            shadowOffsetY: 0,
        };
    }
    if (isDisabled) {
        backgroundColor = '#F5F5F5';
        borderColor = '#E5E5E5';
        borderWidth = 1;
    }
    return {
        borderColor,
        borderWidth,
        backgroundColor,
        ...shadow,
    };
};

export const SLOT_TEXT_STYLE = ({
    isDisabled,
    isActive,
} = {}) => {
    let color = '#B0BCD2';
    if (isDisabled) {
        color = '#CCCCCC';
    }
    if (isActive) {
        color = '#0055CC';
    }
    return {
        textColor: color,
    };
};

export const SLOT_ICON_STYLE = ({
    isDisabled,
    isActive,
} = {}) => {
    let backgroundColor = '#B0BCD2';
    if (isActive) {
        backgroundColor = '#0055CC';
    }
    if (isDisabled) {
        backgroundColor = '#CCCCCC';
    }
    return backgroundColor;
};