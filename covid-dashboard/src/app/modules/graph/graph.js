/* eslint-disable class-methods-use-this */

import Chart from 'chart.js';
import create from '../utils/create';
import Abstract from '../abstract/abstract';
import Select from '../dropdown-select/select';

export default class Graph extends Abstract {
  constructor(parentElem, dataModel) {
    super();
    this.className = 'graph';
    this.dataModel = dataModel;
    this.elements = {};
    this.elements.parent = parentElem;
    this.initConfig();
    this.generateLayout();
    this.chart = new Chart(this.elements.ctx, this.chartConfig);
  }

  generateLayout() {
    this.elements.title = create('h2', 'graph__title', 'Summary', this.elements.parent);
    const parentElem = create('div', 'graph__controls', null, this.elements.parent);
    this.selectUnitPeriod = new Select(parentElem,
      null, 'table_period', null, this.dataModel.unitPeriod, 0, 'select--double',
      ['source', this.className], ['dict', 'unitPeriod']).setHorizontalMargin(10);

    this.selectUnitValue = new Select(parentElem,
      null, 'table_value', null, this.dataModel.unitValue, 1, 'select--double',
      ['source', this.className], ['dict', 'unitValue']).setHorizontalMargin(10);

    this.elements.main = create('div', 'chartBox', null, this.elements.parent);
    // //сам канвас
    this.elements.canvasBox = create('div', 'canvasBox', null, this.elements.main);
    this.elements.canvas = create('canvas', 'canvas', null, this.elements.canvasBox, ['width', '200'], ['height', '70'], ['id', 'chart']);
    this.elements.ctx = this.elements.canvas.getContext('2d');
  }

  initConfig() {
    this.chartConfig = {
      type: 'line',
      data: {
        labels: this.tmpTime,
        datasets: [],
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              // eslint-disable-next-line consistent-return
              callback: (val, index) => {
                if (index === 0) {
                  let strVal = ` ${val}`;
                  if (val > 100000000) strVal = `${strVal.slice(0, -9)}Bn+`;
                  else if (val > 1000000) strVal = `${strVal.slice(0, -6)}M+`;
                  else if (val > 1000) strVal = `${strVal.slice(0, -3)}K+`;
                  return strVal;
                }
              },
              beginAtZero: true,
              display: true,
            },
          }],
          xAxes: [{
            ticks: {
              callback: (val) => {
                const mon = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
                return mon[val.getMonth()];
              },
              display: true,
            },
          }],
        },
      },
    };
  }

  addLineToChart() {
    this.chartConfig.data.labels = this.tmpTime;
    const newLine = {
      label: this.nameCh,
      data: this.tmpCount,
      backgroundColor: '#FF808B',
      borderColor: '#FF808B',
      borderWidth: 0.1,
      fill: true,
    };
    this.chartConfig.data.datasets.push(newLine);
    this.chart.update();
  }

  // установка имени показателя
  setChartName(valArr) {
    const country = this.dataModel.filter.selectedCountry;
    this.elements.title.innerHTML = country || 'Summary';

    this.chartConfig.data.datasets.pop();
    this.chart.update();

    if (!valArr[0]) {
      this.nameCh = 'Not implemented';
    } else {
      this.nameCh = this.dataModel.getValueFromFilter('indicators', 'name');
    }
    if (!this.nameCh) this.nameCh = 'Not implemented';
    this.tmpTime = [];
    this.tmpCount = [];
    valArr.forEach((item) => {
      this.tmpTime.push(item.Date);
      this.tmpCount.push(item.Cases100k ? item.Cases100k : item.Cases);
    });

    this.addLineToChart();
  }

  catchEvent(eventName, detail) {
    if (eventName.match(/dataForChartUpdated/)) this.setChartName(detail.data);
    if (eventName === 'filterChange') this.filterChange(detail.filter, detail.source);
    if (eventName === 'filterChangeFromSelect') this.filterChangeFromSelect(detail.dict, detail.source);
  }
}
