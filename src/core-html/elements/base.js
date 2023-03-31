import { Configration } from "../configrations";
function Base() {
    this.parent = null;
}
Base.prototype.__context__ = {};
Base.prototype.getLang = function() {
    return Configration.getLanguage(this.__context__.lang);
}
export default Base;