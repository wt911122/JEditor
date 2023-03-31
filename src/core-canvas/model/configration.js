import { prepareCacheCanvas } from '../dom-utils/canvas';
const Configration = {
    paragraph: {
        lineHeight: 14,
        lineSpace: 2,
    },
    padding: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
    },
    font: {
        fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Helvetica,Tahoma,Arial,Noto Sans,PingFang SC,Microsoft YaHei,Hiragino Sans GB,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',
        fontSize: 14,
        fontWeight: 'normal',
    },
    cursor: {
        color: '#000',
    }
}


export function resolveConfigration(configs) {
    Object.assign(Configration.padding, configs.padding || {});
    Object.assign(Configration.font, configs.font || {})
    Object.assign(Configration.paragraph, configs.paragraph || {});
    Object.assign(Configration.cursor, configs.cursor || {})
    console.log(Configration)
    prepareCacheCanvas(ctx => {
        ctx.font = `${Configration.font.fontSize}px ${Configration.font.fontFamily}`;
    })
}


export default Configration;