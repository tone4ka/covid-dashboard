/* eslint-disable import/extensions */
import create from './utils/create';

export default class Key {
  constructor({
    small, shift, code, icon,
  }) {
    this.small = small;
    this.shift = shift;
    this.code = code;
    this.icon = icon;
    this.isFnKey = Boolean(small.match(/Ctrl|Alt|Shift|Tab|Back|arr|Del|Enter|Caps|Win/) || code.match(/Lang|Hide|Volume|Voice/));

    if (shift && shift.match(/[^a-zA-Zа-яА-ЯёЁ0-9]/) && !icon) {
      // в шифте спец-символ
      this.spec = create('div', 'spec', this.shift);
    } else {
      this.spec = create('div', 'spec', '');
    }

    if (icon) {
      this.letter = create('i', 'material-icons', icon); // add to inactive: md-light md-inactive
    } else {
      this.letter = create('div', 'letter', small);
    }

    this.key = create('div', 'keyboard__key', [this.spec, this.letter], null, ['code', this.code],
      this.isFnKey ? ['fn', 'true'] : ['fn', 'false']);

    if (code.match(/CapsLock|Shift|Control/g)) this.key.classList.add('keyboard__key--activatable');
    if (code.match(/Hide|Volume|Voice/g)) {
      this.key.classList.add('keyboard__key--dark', 'keyboard__key-press');
      this.key.dataset.isactive = true;
    }
  }
}
