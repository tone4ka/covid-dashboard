/* eslint-disable import/extensions */
import create from './utils/create';

export default class Sound {
  constructor({ url, code }) {
    this.url = url;
    this.code = code;
    this.sound = create('audio', 'sounds__audio', null, null, ['src', `${url}`], ['code', this.code]);

    return this;
  }
}
