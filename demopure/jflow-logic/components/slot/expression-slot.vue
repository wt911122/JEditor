<template>
    <j-group 
        ref="root"
        :configs="wrapperConfigs">
        <j-input-slot
            :configs="configs">
        </j-input-slot>
        </j-text>
    </j-group>
</template>

<script>
import { LinearLayout } from '@joskii/jflow';
import {
    SLOT_STYLE,
    SLOT_TEXT_STYLE,
    SLOT_ICON_STYLE,
} from '../style';

const groupLayout = new LinearLayout({
    direction: 'horizontal',
    gap: 0,
});

export default {
    props: {
        textValue: String,
    },
    computed: {
        configs() {
            return {
                borderRadius: 4,
                height: 24,
                ...SLOT_STYLE(),
                ...SLOT_TEXT_STYLE(),
                iconColor: SLOT_ICON_STYLE(),
                fontSize: '12px',
                textAlign: 'left',
                content: this.textValue,
                lineHeight: 12,
                minWidth: 24,
                maxWidth: 300,
            };
        },
        wrapperConfigs() {
            if(this.inputState) {
                return {
                    layout: groupLayout,
                    borderColor: '#337EFF',
                    backgroundColor: '#F2F7FE',
                    borderWidth: 2,
                    borderRadius: 4,
                    paddingLeft: 4,
                    paddingRight: 4,
                    paddingTop: 6,
                    paddingBottom: 6,
                }
            }
            return {
                layout: groupLayout,
                borderColor: 'transparent',
                backgroundColor: 'transparent',
                borderWidth: 0,
                borderRadius: 0,
                padding: 0,
            }
        },
    },
};

</script>

<style>
</style>
