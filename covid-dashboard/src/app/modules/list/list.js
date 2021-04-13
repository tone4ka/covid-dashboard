import create from '../utils/create';
import Abstract from '../abstract/abstract';
import Country from './country/country';
import Select from '../dropdown-select/select';
import Keyboard from '../keyboard/js/Keyboard';

export default class List extends Abstract {
  constructor(parentElem, model) {
    super();
    this.className = 'list';
    this.title = model.list.title;
    this.elements = {};
    this.elements.parent = parentElem;
    this.dataModel = model;
    this.generateLayout();
    this.fillCountryList(this.dataModel.list.data, true);
    return this;
  }

  generateLayout() {
    const listFormInput = create('form', 'search countries-general__search', null, this.elements.parent);
    const listSearchInner = create('div', 'search__inner', null, listFormInput);
    const inputWrap = create('div', 'search__input-wrap', null, listSearchInner);
    this.elements.input = create('input', null, null, inputWrap, ['type', 'text'], ['placeholder', 'Search country']);
    create('i', 'fas fa-search search-icon', null, inputWrap);
    this.elements.keyboardButton = create('i', 'far fa-keyboard search__keyboard-toggle', null, listSearchInner);

    this.elements.keyboard = new Keyboard(this.elements.input, this.elements.keyboardButton)
      .init().generateLayout();

    this.select = new Select(this.elements.parent,
      null,
      'list_cases', null, this.dataModel.indicators, 0, null,
      ['source', this.className], ['dict', 'indicators']);

    const generalList = create('div', 'countries-general__list', null, this.elements.parent);
    this.elements.countryList = create('ul', 'countries-general__list-inner', null, generalList);

    this.elements.countryReset = create('button', 'countries-general__reset country-reset', 'View all countries', generalList, ['isactive', 'false']);

    this.elements.input.addEventListener('input', () => this.inputHandler());
    this.elements.countryReset.addEventListener('click', () => { this.countryResetHandler(); this.elements.countryReset.style.display = ''; });
  }

  casesChangeHandler(evt) {
    const { target } = evt;
    const { value } = target.options[target.selectedIndex];
    const filter = { ...this.dataModel.filter };
    filter.indicators = parseInt(value, 10);
    this.createCunstomEvent('filterChange', { filter, source: this.className });
  }

  inputHandler() {
    const filter = { ...this.dataModel.filter };
    filter.country = this.elements.input.value;
    this.createCunstomEvent('filterChange', { filter, source: this.className });
  }

  fillCountryList(data, isFirstLoad = false) {
    this.countryList = [];

    if (isFirstLoad) {
      const loadImage = (url) => new Promise((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', (err) => reject(err));
        img.src = url;
      });

      const flagArr = data.map((item) => loadImage(item.flag));

      Promise.all(flagArr)
        .then((values) => this.fillCountryList(data, false));
    } else {
      const fragment = document.createDocumentFragment();
      data.forEach((element) => {
        const country = new Country(element);
        fragment.appendChild(country.item.main);
        this.countryList.push(country);
      });

      this.elements.countryList.innerHTML = '';
      this.elements.countryList.append(fragment);
    }

    this.elements.countryReset.dataset.isactive = !!(this.dataModel.filter.country
    || this.dataModel.filter.selectedCountry);
    if (this.dataModel.filter.country || this.dataModel.filter.selectedCountry) this.elements.countryReset.style.display = 'block';
  }

  dataUpdated() {
    const { data } = this.dataModel.list;
    this.fillCountryList(data);
  }

  catchEvent(eventName, detail) {
    if (eventName.match(/dataUpdated/)) this.dataUpdated();
    if (eventName.match(/listUpdated/)) this.dataUpdated();
    if (eventName === 'filterChange') this.filterChange(detail.filter, detail.source);
    if (eventName === 'filterChangeFromSelect') this.filterChangeFromSelect(detail.dict, detail.source);
    if (eventName === 'inputHandler') this.inputHandler();
  }
}
