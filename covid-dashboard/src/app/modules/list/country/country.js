import create from '../../utils/create';
import Abstract from '../../abstract/abstract';

export default class Country extends Abstract {
  constructor(obj) {
    super();

    Object.assign(this, obj);

    this.item = {};
    this.item.main = create('li', 'countries-general__list-item', null, null, ['country', this.name], ['active', '0']);

    this.item.value = create('span', null, this.value.toLocaleString(), this.item.main);
    this.item.name = create('span', null, this.name, this.item.main);
    const flagBox = create('div', 'country__flag-box', null, this.item.main);
    this.item.flag = create('img', 'country__flag-icon', null, flagBox, ['src', `${this.flag}`]);

    this.item.main.addEventListener('click', (evt) => this.countryClickHandler(evt));

    return this;
  }

  countryClickHandler(evt) {
    const { parentElement } = this.item.main;

    for (let i = 0; i < parentElement.childNodes.length; i += 1) {
      const li = parentElement.childNodes[i];
      li.dataset.active = 0;
    }
    this.item.main.dataset.active = 1;
    this.createCunstomEvent('countrySelect', { countryName: this.name });
  }

  catchEvent(eventName, detail) {

  }
}
