/* eslint-disable no-param-reassign */
/* eslint-disable import/extensions */
import create from './utils/create';
import lang from './layouts/languages/index';
import addButtons from './layouts/addButtons/index';

import Key from './Key';
import SoundList from './SoundList';
import Voice from './Voice';
import LanguageChange from './LanguageChange';

import '../css/style.sass';
// import Popup from './Popup.js';

export default class Keyboard {
  constructor(output, openCloseToggle) {
    const rowsOrder = [
      ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Delete'],
      ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash', 'Backspace'/* , 'IntlBackslash' */],
      ['CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote'/* , 'Enter' */],
      ['ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash'/* ,'ArrowUp', 'ShiftRight' */],
      ['Sound', 'Lang', /* 'AltLeft', */ 'Hide', 'Space', 'Voice', /* , 'AltRight' */ 'ArrowLeft', /* 'ArrowDown', */'ArrowRight'/* ,'ControlRight' */],
    ];

    this.rowsOrder = rowsOrder;
    this.keyPresssed = {};
    this.isCaps = false;
    this.openCloseBtn = openCloseToggle;
    this.output = {
      output,
      setValue(value) {
        this.output.value = value;

        const customEvt = new CustomEvent('inputHandler', {
          detail: null,
        });

        document.dispatchEvent(customEvt);
      },
      getValue() { return this.output.value; },
      getObj() { return this.output; },
    };
    this.isEnabled = false;
    // const popup = new Popup('Hello!');
  }

  init() {
    // lang obj
    this.language = new LanguageChange();
    this.keyDict = lang[this.language.curLanguage];

    this.keyboard = create('div', 'keyboard keyboard-hidden', null, document.body,
      ['language', this.language.curLanguage]);

    // additional func key
    this.addButtons = addButtons;

    // sound obj
    this.sound = new SoundList(this.language.curLanguage).init();
    document.body.appendChild(this.sound.soundList);

    // voice obj
    this.voice = new Voice(this.language.curLanguage, this.output);

    document.addEventListener('kbLangChange', (e) => { this.languageChangeHandler(e); });

    return this;
  }

  generateLayout() {
    this.keyButtons = [];
    this.rowsOrder.forEach((row, i) => {
      const rowElem = create('div', 'keyboard__row', null, this.keyboard, [
        'row',
        i + 1,
      ]);
      row.forEach((code) => {
        let keyObj;
        let keyButton = {};
        keyObj = this.keyDict.find((key) => key.code === code);
        if (keyObj) {
          keyButton = new Key(keyObj);
          this.keyButtons.push(keyButton);
          rowElem.appendChild(keyButton.key);
        } else {
          // поищем в addButtons
          keyObj = this.addButtons.find((key) => key.code === code);
          if (keyObj) {
            if (this[keyObj.small] && this[keyObj.small].generateLayout) {
              this[keyObj.small].generateLayout(keyObj);

              rowElem.appendChild(this[keyObj.small][`${keyObj.small}Key`].key);
            } else if (keyObj.code === 'Hide') {
              keyButton = new Key(keyObj);
              keyButton.key.addEventListener('click', () => { this.hideKeyboardHandler(); });
              this.hideButton = keyButton;
              rowElem.appendChild(keyButton.key);
            }
          }
        }
      });
    });

    document.addEventListener('keydown', (e) => { this.handlerEvent(e); });
    document.addEventListener('keyup', (e) => { this.handlerEvent(e); });
    this.keyboard.addEventListener('mouseup', (e) => { this.preHandlerEvent(e); });
    this.keyboard.addEventListener('mousedown', (e) => { this.preHandlerEvent(e); });

    /*  this.output.getObj().addEventListener('click', () => { this.showKeyboard(); }); */
    this.openCloseBtn.addEventListener('click', () => {
      if (this.isEnabled) this.hideKeyboardHandler();
      else this.showKeyboard();
    });

    return this;
  }

  showKeyboard() {
    this.isEnabled = true;
    this.keyboard.classList.remove('keyboard-hidden');
    return this;
  }

  hideKeyboardHandler() {
    this.isEnabled = false;
    this.keyboard.classList.add('keyboard-hidden');
    this.hideButton.key.classList.remove('keyboard__key--active');
  }

  preHandlerEvent(evt) {
    if (!this.isEnabled) return;
    evt.stopPropagation();
    const keyDiv = evt.target.closest('.keyboard__key');
    if (!keyDiv) return;
    const { dataset: { code } } = keyDiv;
    this.handlerEvent({ code, type: evt.type });
  }

  handlerEvent(evt) {
    if (!this.isEnabled) return;
    if (evt.stopPropagation) evt.stopPropagation();
    // evt.preventDefault();

    const { code, type } = evt;
    const keyObj = this.keyButtons.find((key) => key.code === code);
    if (!keyObj) return;

    const keyOrder = this.rowsOrder.flat(1).find((key) => key === code);
    if (!keyOrder) return;

    this.output.getObj().focus();
    if (type.match(/keydown|click|mousedown/)) {
      if (!type.match(/mouse/)) evt.preventDefault();
      keyObj.key.classList.add('keyboard__key--active');

      if (code.match(/Shift/)) this.setStateButton(keyObj.key, 'shiftKey', true, type);
      if (code.match(/CapsLock/)) this.setStateButton(keyObj.key, 'capsKey', this.capsKey !== true, type);

      const isUpper = ((this.capsKey && !this.shiftKey) || (!this.capsKey && this.shiftKey));
      this.setUpperCase(isUpper);
      this.printLetter(keyObj);
      this.sound.play(code);
    } else if (type.match(/keyup|mouseup/)) {
      if (code.match(/Shift/) && type === 'keyup') this.setStateButton(keyObj.key, 'shiftKey', false);
      const isUpper = ((this.capsKey && !this.shiftKey) || (!this.capsKey && this.shiftKey));
      this.setUpperCase(isUpper);

      if (
        (type.match(/key/) && !code.match(/CapsLock/))
        || (type.match(/mouse/) && !code.match(/CapsLock/)
        && type.match(/mouse/) && !code.match(/Shift/))
      ) {
        keyObj.key.classList.remove('keyboard__key--active');
      }
    }
  }

  printLetter(keyObj) {
    const outValue = this.output.getValue();
    let currPos = this.output.getObj().selectionStart;
    const leftPart = outValue.slice(0, currPos);
    const rightPart = outValue.slice(currPos);

    const actionHander = {
      ArrowLeft: () => {
        currPos = currPos - 1 >= 0 ? currPos - 1 : 0;
      },
      ArrowRight: () => {
        currPos = currPos + 1 <= outValue.length ? currPos + 1 : outValue.length;
      },
      Enter: () => {
        this.output.setValue(`${leftPart}\n${rightPart}`);
        currPos += 1;
      },
      Backspace: () => {
        this.output.setValue(`${leftPart.slice(0, leftPart.length - 1)}${rightPart}`);
        currPos = currPos - 1 >= 0 ? currPos - 1 : 0;
      },
      Delete: () => {
        this.output.setValue(`${leftPart}${rightPart.slice(1)}`);
      },
      Space: () => {
        this.output.setValue(`${leftPart} ${rightPart}`);
        currPos += 1;
      },

    };

    if (actionHander[keyObj.code]) {
      actionHander[keyObj.code]();
    } else if (!keyObj.isFnKey) {
      let value = '';
      if (!keyObj.spec.textContent) {
        value = this.getButtonValue(keyObj);
      } else {
        value = (this.shiftKey) ? keyObj.spec.textContent : keyObj.letter.textContent;
      }
      this.output.setValue(leftPart + value + rightPart);
      currPos += 1;
    }

    this.output.getObj().setSelectionRange(currPos, currPos);
  }

  setStateButton(elem, prop, value, actionSource) {
    if (value) {
    // условие для mouse-click
      if (this[prop] && actionSource && actionSource.match(/click|mouse/)) {
        elem.classList.remove('keyboard__key--active');
        this[prop] = false;
        return;
      } if (this[prop] === value && actionSource && actionSource.match(/key/)) {
        return;
      }
      elem.classList.add('keyboard__key--active');
      this[prop] = true;
    } else {
      elem.classList.remove('keyboard__key--active');
      this[prop] = false;
    }
  }

  getButtonValue(keyObj) {
    if (this.isUpper && !keyObj.isFnKey && !keyObj.spec.textContent) {
      return keyObj.shift;
    } if (!this.isUpper && !keyObj.isFnKey && !keyObj.spec.textContent) {
      return keyObj.small;
    }
    return null;
  }

  setUpperCase(isUpper) {
    this.isUpper = isUpper;
    this.keyButtons.forEach((keyObj) => {
      if (this.shiftKey && keyObj.spec.textContent) {
        keyObj.spec.classList.add('spec-active');
        keyObj.letter.classList.add('letter-spec-active');
      } else if (!this.shiftKey && keyObj.spec.textContent) {
        keyObj.spec.classList.remove('spec-active');
        keyObj.letter.classList.remove('letter-spec-active');
      }

      const btnValue = this.getButtonValue(keyObj);
      keyObj.letter.innerHTML = (btnValue) || keyObj.letter.innerHTML;
    });
  }

  languageChangeHandler(evt) {
    const curLang = evt.detail.lang;
    this.keyDict = lang[curLang];
    this.keyboard.dataset.language = curLang;

    this.keyButtons.forEach((btn) => {
      const keyObj = this.keyDict.find((key) => key.code === btn.code);
      if (!keyObj) return;
      btn.shift = keyObj.shift;
      btn.small = keyObj.small;
      if (!keyObj.icon && keyObj.shift && keyObj.shift.match(/[^a-zA-Zа-яА-ЯёЁ0-9]/g)) {
        btn.spec.innerHTML = keyObj.shift;
      } else {
        btn.spec.innerHTML = '';
      }
      btn.letter.innerHTML = (keyObj.icon) ? keyObj.icon : keyObj.small;
    });

    return this;
  }
}
