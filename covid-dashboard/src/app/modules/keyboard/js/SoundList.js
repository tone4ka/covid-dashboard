/* eslint-disable import/extensions */
import create from './utils/create';
import Sound from './Sound';
import * as storage from './storage';
import Key from './Key';
import sounds from './sounds/index';

export default class SoundList {
  constructor(langCode) {
    this.soundList = {};
    this.sounds = [];
    this.isSoundOn = storage.get('kbIsSoundOn', true);
    this.langCode = langCode;
    this.soundList = create('div', 'keyboard__sounds sounds', null, null, ['language', langCode]);

    document.addEventListener('kbLangChange', (evt) => this.languageChangeHandler(evt));

    return this;
  }

  init() {
    this.soundDict = sounds[this.langCode];
    if (this.sounds.length && this.soundDict) {
      this.soundDict.forEach((soundObj) => {
        const soundItem = this.sounds.find((item) => soundObj.code === item.code);
        soundItem.url = soundObj.url;
        soundItem.sound.src = soundObj.url;
      });
    } else if (this.soundDict) {
      this.soundDict.forEach((soundObj) => {
        const soundItem = new Sound(soundObj);
        this.sounds.push(soundItem);
        this.soundList.appendChild(soundItem.sound);
      });
    } else if (this.sounds.length) {
      // no sound for language
      this.sounds.forEach((soundObj) => {
        soundObj.sound.remove();
      });
      this.sounds = [];
    }

    return this;
  }

  generateLayout(keyObj) {
    const keyButton = new Key(keyObj);
    this.soundKey = keyButton;
    keyButton.key.addEventListener('click', () => this.soundOff());
    this.updateLayout();
    return this;
  }

  updateLayout() {
    const keyObj = this.soundKey;
    if (this.isSoundOn) {
      keyObj.key.classList.add('keyboard__key--dark', 'keyboard__key-press');
      keyObj.letter.innerHTML = keyObj.icon;
      keyObj.letter.classList.remove('md-light', 'md-inactive');
    } else {
      keyObj.key.classList.remove('keyboard__key--dark', 'keyboard__key-press');
      keyObj.letter.innerHTML = keyObj.shift;
      keyObj.letter.classList.add('md-light', 'md-inactive');
    }
    keyObj.key.classList.remove('keyboard__key--active');
  }

  play(code) {
    let soundObj = this.sounds.find((sound) => sound.code === code);
    if (!soundObj) {
      soundObj = this.sounds.find((sound) => sound.code === 'Other');
    }

    if (soundObj && this.isSoundOn) {
      soundObj.sound.currentTime = 0;
      if (soundObj.url) {
        soundObj.sound.play();
      }
    }
  }

  soundOff() {
    this.isSoundOn = !this.isSoundOn;
    this.play();
    this.updateLayout();

    storage.set('kbIsSoundOn', this.isSoundOn);
  }

  languageChangeHandler(evt) {
    const { lang } = evt.detail;
    this.langCode = lang;
    this.init(lang);
  }
}
