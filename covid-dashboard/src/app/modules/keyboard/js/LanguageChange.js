/* eslint-disable import/extensions */
import * as storage from './storage';
import Key from './Key';
import lang from './layouts/languages/index';

export default class LanguageChange {
  constructor() {
    this.curLanguage = storage.get('kbLang', '"ru"');
    this.curLanguage = (lang[this.curLanguage]) ? this.curLanguage : Object.keys(lang)[0];

    return this;
  }

  generateLayout(keyObj) {
    const keyButton = new Key(keyObj);
    this.languageKey = keyButton;
    keyButton.letter.innerText = this.getLangName();
    keyButton.key.addEventListener('click', () => this.languageChangeHandler());
    return this;
  }

  getLangName() { return this.curLanguage[0].toUpperCase() + this.curLanguage.slice(1); }

  languageChangeHandler() {
    const langCodes = Object.keys(lang);
    const langIdx = (langCodes.indexOf(this.curLanguage) + 1) % langCodes.length;
    this.curLanguage = langCodes[langIdx];
    this.languageKey.letter.innerText = this.getLangName();

    storage.set('kbLang', langCodes[langIdx]);

    const evtChangeLang = new CustomEvent('kbLangChange', {
      detail: {
        lang: langCodes[langIdx],
      },
    });

    document.dispatchEvent(evtChangeLang);
  }
}
