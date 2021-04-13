/* eslint-disable class-methods-use-this */
export default class abstract {
  constructor() {
    this.evtArr = ['listUpdated', 'filterChange',
      'dataUpdated', 'dataForChartUpdated',
      'countrySelect', 'filterChangeFromSelect',
      'inputHandler', 'mapFullScreen'];

    this.evtArr.forEach((evtName) => {
      document.addEventListener(evtName, (evt) => this.catchEvent(evtName, evt.detail));
    });
  }

  createCunstomEvent(eventName, eventObj, timeOut) {
    const customEvt = new CustomEvent(eventName, {
      detail: eventObj,
    });

    if (timeOut) {
      setTimeout(() => document.dispatchEvent(customEvt), timeOut);
    } else {
      document.dispatchEvent(customEvt);
    }
  }

  filterChangeFromSelect(dict, source) {
    if (source !== this.className) return;
    if (!source.match(/list|map|graph|table/)) return;

    const filter = { ...this.dataModel.filter };
    filter[dict.name] = parseInt(dict.id, 10);
    this.createCunstomEvent('filterChange', { filter, source: this.className });
  }

  filterChange(filter, source) {
    if (source === this.className) return;

    // to-do Починить, когда появятся селекты
    if (this.selectUnitPeriod) this.selectUnitPeriod.selectById(filter.unitPeriod);
    if (this.selectUnitValue) this.selectUnitValue.selectById(filter.unitValue);
  }

  countryResetHandler() {
    const filter = { ...this.dataModel.filter };
    filter.country = '';
    filter.selectedCountry = '';
    this.createCunstomEvent('filterChange', { filter, source: this.className });
  }

  catchEvent(eventName) {
    if (this.evtArr.indexOf(eventName) > -1) {
      throw new Error('Not implemented exception.');
    }
  }
}
