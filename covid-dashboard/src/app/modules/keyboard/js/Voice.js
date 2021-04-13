/* eslint-disable import/extensions */
import * as storage from './storage';
import Key from './Key';
import langDict from './layouts/voiceLanguages/index';
import Popup from './Popup';

export default class Voice {
  constructor(langCode, output) {
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.isActive = storage.get('kbIsVoiceAtcive', false);
    this.langCode = langCode;
    this.output = output;

    // eslint-disable-next-line no-undef
    this.recognition = new SpeechRecognition();
    this.recognition.interimResults = true;
    this.recognition.lang = this.getLangByCode(langCode);

    this.recognition.addEventListener('result', (e) => {
      const transcript = Array.from(e.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join('');

      const poopScript = transcript.replace(/poop|poo|shit|dump/gi, '💩');

      if (e.results[0].isFinal) {
        this.printWord(poopScript);
      }
    });
    this.recognition.addEventListener('end', () => this.recognition.start());

    if (this.isActive) {
      this.recognition.start();
    }

    document.addEventListener('kbLangChange', (evt) => this.languageChangeHandler(evt));

    return this;
  }

  getLangByCode(langCode) {
    const obj = langDict.find((elem) => elem.code === langCode);
    if (obj) {
      return obj.isoCode;
    }
    const popup = new Popup('Speech recognition is not supported for seleced language');
    this.isActive = false;
    storage.set('kbIsVoiceAtcive', this.isActive);
    return null;
  }

  printWord(text) {
    const outValue = this.output.getValue();
    let currPos = this.output.getObj().selectionStart;
    const leftPart = outValue.slice(0, currPos);
    const rightPart = outValue.slice(currPos);

    this.output.setValue(leftPart + text + rightPart);
    currPos += text.length;
    this.output.getValue().setSelectionRange(currPos, currPos);
    this.output.getValue.focus();
  }

  generateLayout(keyObj) {
    const keyButton = new Key(keyObj);
    this.voiceKey = keyButton;
    keyButton.key.addEventListener('click', () => this.voiceAtcive());
    this.updateLayout();
    return this;
  }

  updateLayout() {
    const keyObj = this.voiceKey;
    if (this.isActive) {
      keyObj.letter.classList.remove('md-light', 'md-inactive');
      keyObj.key.classList.add('keyboard__key--dark', 'keyboard__key-press');
    } else {
      keyObj.letter.classList.add('md-light', 'md-inactive');
      keyObj.key.classList.remove('keyboard__key--dark', 'keyboard__key-press');
    }
  }

  voiceAtcive() {
    this.isActive = !this.isActive;

    const startHandler = () => {
      this.recognition.start();
    };

    if (this.isActive) {
      try {
        this.recognition.start();
        this.recognition.addEventListener('end', () => startHandler);
      } catch (e) {
        const popup = new Popup('An error occurred while trying to record voice. Please try again in a few seconds');
        this.isActive = false;
        this.recognition.abort();
        this.recognition.removeEventListener('end', startHandler);
        this.updateLayout();
        storage.set('kbIsVoiceAtcive', this.isActive);
      }
    } else {
      this.recognition.abort();
      this.recognition.removeEventListener('end', startHandler);
    }

    this.updateLayout();

    storage.set('kbIsVoiceAtcive', this.isActive);
  }

  languageChangeHandler(evt) {
    const { lang } = evt.detail;
    this.recognition.lang = this.getLangByCode(lang);

    const startHandler = () => {
      this.recognition.start();
    };

    const stopHandler = () => {
      this.recognition.start();
      this.recognition.addEventListener('end', startHandler);
      this.recognition.removeEventListener('end', stopHandler);
    };

    if (this.isActive) {
      this.recognition.removeEventListener('end', startHandler);
      this.recognition.addEventListener('end', stopHandler);

      this.recognition.stop();
      this.recognition.abort();
    } else {
      this.recognition.removeEventListener('end', startHandler);
      this.recognition.removeEventListener('end', stopHandler);
      this.recognition.stop();
      this.recognition.abort();
      this.updateLayout();
    }
  }
}
