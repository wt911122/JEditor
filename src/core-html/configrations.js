import Language from './model/language';

export const Configration = {
    languages: new Map(),
    getLanguage(name) {
        return Configration.languages.get(name);
    },
    registLanguage(name, lang) {
        Configration.languages.set(name, new Language(lang))
    }
}