import create from '../utils/create';
import Abstract from '../abstract/abstract';
import Select from '../dropdown-select/select';

export default class Table extends Abstract {
  constructor(parentElem, model) {
    super();
    this.className = 'table';
    this.dataModel = model;
    this.elements = {};
    this.elements.parent = parentElem;

    this.generateLayout();
    this.updateTableCells();
    return this;
  }

  generateLayout() {
    create('h2', 'table__title', 'Data By Country', this.elements.parent);

    const controls = create('div', 'table__controls', null, this.elements.parent);
    this.selectUnitPeriod = new Select(controls,
      null, 'table_period', null, this.dataModel.unitPeriod, 0, 'select--double',
      ['source', this.className], ['dict', 'unitPeriod']).setHorizontalMargin(10);

    this.selectUnitValue = new Select(controls,
      null, 'table_value', null, this.dataModel.unitValue, 1, 'select--double',
      ['source', this.className], ['dict', 'unitValue']).setHorizontalMargin(10);

    const tableContainer = create('div', 'table-container', null, this.elements.parent);
    this.elements.table = create('table', 'table-data', null, tableContainer);

    this.elements.countryReset = create('button', 'table__reset country-reset', 'View all countries', tableContainer, ['isactive', 'false']);

    const thead = create('thead', 'table-data__head', null, this.elements.table);
    const firstRow = create('tr', 'table__tr', null, thead);
    this.dataModel.table.titles.forEach((h) => {
      create('th', 'table-data__head-item', h.name, firstRow);
    });

    this.elements.tbody = create('tbody', 'table-data__body', null, this.elements.table);
    this.elements.countryReset.addEventListener('click', () => { this.countryResetHandler(); this.elements.countryReset.style.display = ''; });
    this.elements.table.addEventListener('click', (evt) => this.tableClickHandler(evt));
  }

  tableClickHandler(evt) {
    const tr = evt.target.closest('.table-data__body-row');
    if (tr.dataset.country) {
      this.createCunstomEvent('countrySelect', { countryName: tr.dataset.country });
    }
  }

  indicatorChangeHandler(evt) {
    const { target } = evt;
    const { value } = target.options[target.selectedIndex];
    const filter = { ...this.dataModel.filter };
    if (target.dataset.code === 'periods') {
      filter.unitPeriod = parseInt(value, 10);
    } else if (target.dataset.code === 'values') {
      filter.unitValue = parseInt(value, 10);
    } else {
      return;
    }

    this.createCunstomEvent('filterChange', { filter, source: this.className });
  }

  updateTableCells() {
    const cells = [];
    const rows = [];
    const fragment = document.createDocumentFragment();
    this.dataModel.table.data.forEach((dataElem) => {
      const row = create('tr', 'table-data__body-row', null, fragment /* , ['country', dataElem[0]] */);
      dataElem.forEach((val, idx) => {
        const cell = create('td', 'table-data__body-col', idx ? val.toLocaleString() : val, row);
        if (idx === 0) {
          row.dataset.country = val;
          cell.classList.add('--country');
        }
        cells.push(cell);
      });
      rows.push(row);
    });

    this.elements.tbody.innerHTML = '';
    this.elements.tbody.appendChild(fragment);
    this.elements.countryReset.dataset.isactive = !!(this.dataModel.filter.country
      || this.dataModel.filter.selectedCountry);
    if (this.dataModel.filter.country || this.dataModel.filter.selectedCountry) this.elements.countryReset.style.display = 'block';
  }

  catchEvent(eventName, detail) {
    if (eventName.match(/dataUpdated/)) this.updateTableCells();
    if (eventName === 'filterChange') this.filterChange(detail.filter, detail.source);
    if (eventName === 'filterChangeFromSelect') this.filterChangeFromSelect(detail.dict, detail.source);
  }
}
