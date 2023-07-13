<template>
    <j-input-group
        :source="node"
        :configs="selectConfigs">
        <j-text :configs="textDataConfig">
        </j-text>
    </j-input-group>
</template>
        
<script>
    import { HORIZONTAL_LAYOUT, INPUT_STYLE } from'../style';
    export default {
        props: {
            node: Object,
        },
        data() {
            return {
                selectConfigs: {
                    layout: HORIZONTAL_LAYOUT,
                    borderRadius: 4,
                    paddingTop: 6,
                    paddingBottom: 6,
                    paddingLeft: 4,
                    paddingRight: 0,
                    height: 24,
                    swapping: false,
                    ...INPUT_STYLE(),
                }
            }
        },
        computed: {
            itemText() {
                return this.node.toCode();
            },
            textDataConfig() {
                return {
                    fontSize: '12px',
                    textAlign: 'left',
                    lineHeight: 12,
                    fontFamily: 'PingFang SC',
                    content: this.itemText,
                    textColor: '#536995',
                };
            },
        }
    }
</script>