/* eslint-disable import/extensions */
import create from './utils/create';

export default class Popup {
  constructor(text) {
    this.popup = create('div', 'popup', null, null);
    const popopupWrapper = create('div', 'popup__wrapper', create('p', 'popup__text', text, null), this.popup);

    const closeBtn = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
            <path d="M0 0h24v24H0z" fill="none"/>
            <path fill="white" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>`;
    const popupClose = create('div', 'popup__close', closeBtn, popopupWrapper);

    document.body.prepend(this.popup);
    setTimeout(this.popupShow, 1);
    setTimeout(this.popupClose, 3000);

    popupClose.addEventListener('click', () => this.popupClose());

    return this;
  }

  popupClose() {
    this.popup.classList.remove('popup-visilbe');
    this.popup.remove();
  }

  popupShow() {
    this.popup.classList.add('popup-visilbe');
  }
}
