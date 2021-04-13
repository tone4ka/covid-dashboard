import storage from '../utils/storage';
import Status from './status';
import Abstract from '../abstract/abstract';

const get100kStat = (dstObj, objKey100k, srcObj, totalObjKey) => {
  const tmpObj = dstObj;
  tmpObj[objKey100k] = srcObj[totalObjKey] * 10 ** 5;
  tmpObj[objKey100k] /= srcObj.population;
  tmpObj[objKey100k] = parseFloat((tmpObj[objKey100k]).toFixed(2), 10);
};

export default class dataModel extends Abstract {
  constructor() {
    super();

    this.storageName = 'ftnCovidDashborad';
    this.useStorage = false;

    this.indicators = [
      { id: 0, name: 'Cases', code: 'Confirmed' },
      { id: 1, name: 'Deaths', code: 'Deaths' },
      { id: 2, name: 'Recovered', code: 'Recovered' }];

    this.unitPeriod = [
      { id: 0, name: 'All time', code: 'Total' },
      { id: 1, name: 'Last date', code: 'New' }];

    this.unitValue = [
      { id: 0, name: 'Total', code: '' },
      { id: 1, name: 'Per 100k', code: '100k' }];

    this.filter = {
      indicators: 0,
      unitPeriod: 0,
      unitValue: 0,
      country: '',
      selectedCountry: '',
    };

    this.list = {};
    this.list.title = `${this.getValueFromFilter('indicators', 'name')} by country`;
    this.list.data = [];

    this.table = {};
    this.table.titles = [];
    this.table.titles.push({ id: -1, name: 'Country', code: 'Country' });
    this.indicators.forEach((element) => {
      this.table.titles.push(element);
    });
    this.table.data = [];

    this.status = new Status(null, null);
    return this;
  }

  initData() {
    const storageData = storage.get(this.storageName, null);

    const isDateParseCurrent = (dateParse) => {
      const curDate = new Date();
      const parseDate = new Date(dateParse);

      return curDate.getUTCFullYear() === parseDate.getUTCFullYear()
                && curDate.getUTCMonth() === parseDate.getUTCMonth()
                && curDate.getUTCDate() === parseDate.getUTCDate();
    };

    if (!this.useStorage
          || (!storageData || (storageData && !isDateParseCurrent(storageData.dateParse)))
    ) {
      const chainPromises = [];

      const allTotalInfoPromise = fetch('https://disease.sh/v3/covid-19/countries?yesterday=1')
        .then((response) => response.json())
        .catch((errMsg) => { throw new Error(errMsg); });
      chainPromises.push(allTotalInfoPromise);

      return Promise.all(chainPromises)
        .then((values) => {
          this.parseData(values);
          return Promise.resolve(this.status);
        })
        .catch(() => {
          this.initDefSettings();
          if (this.status.code === -1) return Promise.reject(this.status);
          return Promise.resolve(this.status);
        });
    }
    this.prepareDataFromStorage(storageData);

    return Promise.resolve(new Status(2, 'Используются ранее загруженные данные'));
  }

  initDefSettings() {
    this.data = storage.get(this.storageName, null);
    if (!this.data) {
      this.status = new Status(-1, 'Сбой при работе API. Попробуйте воспользоваться сервисом позже');
    } else {
      this.status = new Status(0, 'Сбой при работе API. Используются ранее загруженные данные');
    }
  }

  prepareDataFromStorage(storageData) {
    this.dateParse = storageData.dateParse;
    this.global = storageData.global;
    this.statistic = storageData.statistic;
    this.filter = storageData.filter;

    this.statistic.forEach((s) => {
      const stat = s;
      const keys = Object.keys(stat);

      keys.forEach((key) => {
        if (this.indicators.some((ind) => ind.code.indexOf(key) > -1)) {
          const val = stat[key];

          if (typeof val === 'string') stat[key] = parseFloat(stat[key]);
        }
      });
    });
    this.initCurentData();
  }

  parseData(values) {
    const [cases] = values;
    this.dateParse = new Date();

    this.global = {};
    this.statistic = [];

    cases.forEach((country, idx) => {
      if (idx === 0) this.dateParse = new Date(country.updated);
      const countryObj = {};
      countryObj.Country = country.country;
      countryObj.name = country.country;
      countryObj.Date = new Date(country.updated);
      countryObj.TotalConfirmed = country.cases;
      countryObj.NewConfirmed = country.todayCases;
      countryObj.TotalDeaths = country.deaths;
      countryObj.NewDeaths = country.todayDeaths;
      countryObj.TotalRecovered = country.recovered;
      countryObj.NewRecovered = country.todayRecovered;
      countryObj.population = country.population;
      // 100k
      countryObj.TotalConfirmed100k = Math.ceil(country.casesPerOneMillion / 10);
      countryObj.NewConfirmed100k = Math.ceil((country.todayCases * 10 ** 5) / country.population);
      countryObj.TotalDeaths100k = Math.ceil(country.deathsPerOneMillion / 10);
      countryObj.NewDeaths100k = Math.ceil((country.todayDeaths * 10 ** 5) / country.population);
      countryObj.TotalRecovered100k = Math.ceil(country.recoveredPerOneMillion / 10);
      countryObj.NewRecovered100k = Math.ceil(
        (country.todayRecovered * 10 ** 5) / country.population,
      );

      countryObj.flag = country.countryInfo.flag;
      countryObj.lat = country.countryInfo.lat;
      countryObj.long = country.countryInfo.long;
      countryObj.iso2 = country.countryInfo.iso2;
      countryObj.iso3 = country.countryInfo.iso3;

      this.statistic.push(countryObj);
    });

    // update global stat
    this.global.population = this.statistic.reduce((pr, cr) => pr + cr.population, 0);
    this.unitPeriod.forEach((unit) => {
      this.indicators.forEach((indicator) => {
        const unitTotal = this.unitValue.find((f) => f.id === 0);
        const unit100k = this.unitValue.find((f) => f.id === 1);

        const atrName100k = unit.code + indicator.code + unit100k.code;
        const atrNameTotal = unit.code + indicator.code + unitTotal.code;

        this.global[atrNameTotal] = this.statistic.reduce((pr, cr) => pr + cr[atrNameTotal], 0);
        this.global[atrName100k] = Math.ceil(
          (this.global[atrNameTotal] * 10 ** 5) / this.global.population,
        );
      });
    });

    this.initCurentData();

    // save localStorage
    const storageData = {
      dateParse: this.dateParse,
      global: this.global,
      statistic: this.statistic,
      filter: this.filter,
    };
    storage.set(this.storageName, storageData);

    this.status = new Status(1, 'Ok');
  }

  getValueFromFilter(objKey, objAttr) {
    try {
      const res = this[objKey].find((e) => e.id === this.filter[objKey])[objAttr];
      return res;
    } catch (e) {
      throw new Error(`Cant finde attr "${objAttr}" in "${objKey}"`);
    }
  }

  initCurentData(initList = true, initTable = true) {
    if (initList) this.list.data.length = 0;
    if (initTable) this.table.data.length = 0;

    const statByCountry = this.statistic
      .filter((e) => !this.filter.country || e.name
        .toLowerCase()
        .indexOf(this.filter.country.toLowerCase()) === 0);

    const listParam = this.getValueFromFilter('unitPeriod', 'code')
                  + this.getValueFromFilter('indicators', 'code')
                  + this.getValueFromFilter('unitValue', 'code');

    statByCountry.forEach((stat) => {
      // list
      if (initList) {
        if (stat[listParam] && typeof stat[listParam] === 'number') {
          this.list.data.push({
            name: stat.name,
            value: stat[listParam],
            flag: stat.flag,
            descr: listParam,
            lat: stat.lat,
            long: stat.long,
          });
        }
      }

      // table
      if (initTable) {
        const row = [];
        this.indicators.forEach((indicator) => {
          const attrName = this.getValueFromFilter('unitPeriod', 'code')
        + indicator.code
        + this.getValueFromFilter('unitValue', 'code');

          if (!row.length) row.push(stat.name);

          row.push(stat[attrName]);
        });

        this.table.data.push(row);
      }
    });

    if (initList) {
      // this.list.data = this.list.data.filter((a) => typeof a.value === 'number');
      this.list.data.sort((a, b) => (b.value - a.value));
    }
  }

  filterChange(filter) {
    const isNeedUpdAll = this.filter.selectedCountry !== filter.selectedCountry
    || this.filter.indicators !== filter.indicators
    || this.filter.unitValue !== filter.unitValue
    || this.filter.unitPeriod !== filter.unitPeriod;

    const isNeedUpdList = isNeedUpdAll || this.filter.country !== filter.country;
    this.filter = filter;

    if (isNeedUpdList) {
      this.initCurentData(true, isNeedUpdAll);
      this.createCunstomEvent('listUpdated', {});
    }

    if (isNeedUpdAll) {
      this.createCunstomEvent('dataUpdated', {});
      this.chartUpdate();
    }
  }

  countrySelect(countryName) {
    const filter = { ...this.filter };
    if (countryName !== 'All') {
      filter.country = countryName || '';
      filter.selectedCountry = countryName || '';
      this.filterChange(filter);
    } else {
      this.chartUpdate(null);
    }
  }

  chartUpdate(countryName) {
    if (countryName) this.filter.selectedCountry = countryName;

    const countryStat = this.statistic.find((s) => s.name === this.filter.selectedCountry);

    let urlWithData;
    let graphPromise;

    const prepareRes = (arr) => {
      if (this.filter.unitPeriod === 0) return arr;

      const res = [];
      let prevObj = {};
      for (let i = arr.length - 1; i >= 0; i -= 1) {
        if (i === (arr.length - 1)) {
          prevObj = arr[i];
        } else {
          const newObj = { ...prevObj };
          newObj.Cases = Math.abs(newObj.Cases - arr[i].Cases);
          if (this.getValueFromFilter('unitValue', 'code')) {
            get100kStat(newObj, 'Cases100k', newObj, 'Cases');
          }
          prevObj = arr[i];
          res.push(newObj);
        }
      }
      return res.reverse();
    };

    if (countryStat) {
      urlWithData = `https://api.covid19api.com/total/country/${countryStat.iso3}/status/${this.getValueFromFilter('indicators', 'code').toLowerCase()}`;
      const urlWithDataReserv = `https://disease.sh/v3/covid-19/historical/${countryStat.iso3}?lastdays=all`;
      graphPromise = fetch(urlWithData)
        .then((response) => response.json().then((data) => {
          let res = data.filter((d) => d.Cases !== undefined);
          res = res.map((e) => {
            const element = e;
            element.Date = new Date(element.Date);
            element.population = countryStat.population;
            if (this.getValueFromFilter('unitValue', 'code')) {
              get100kStat(element, 'Cases100k', element, 'Cases');
            }
            return element;
          });

          res.sort((a, b) => Date.parse(a.Date) - Date.parse(b.Date));
          res = prepareRes(res);
          return Promise.resolve(res);
        }))
        .catch(() => fetch(urlWithDataReserv)
          .then((response) => response.json().then((data) => {
            let res = [];
            const arr = data.timeline[this.getValueFromFilter('indicators', 'name').toLowerCase()];

            Object.keys(arr).forEach((key) => {
              const statObj = {
                Date: new Date(key),
                Cases: arr[key],
                population: this.global.population,
                Status: this.getValueFromFilter('indicators', 'code'),
              };

              if (this.getValueFromFilter('unitValue', 'code')) {
                get100kStat(statObj, 'Cases100k', statObj, 'Cases');
              }

              res.push(statObj);
            });

            res.sort((a, b) => Date.parse(a.Date) - Date.parse(b.Date));
            res = prepareRes(res);
            return Promise.resolve(res);
          }))
          .catch((errMsg) => Promise.reject(errMsg)));
    } else {
      // summary-data
      urlWithData = `https://disease.sh/v3/covid-19/historical/all?lastdays=366`;
      graphPromise = fetch(urlWithData)
        .then((response) => response.json().then((data) => {
          const indicator = this.getValueFromFilter('indicators', 'name');
          const arr = data[indicator.toLowerCase()];
          let res = [];
          Object.keys(arr).forEach((key) => {
            const statObj = {
              Date: new Date(key),
              Cases: arr[key],
              population: this.global.population,
              Status: this.getValueFromFilter('indicators', 'code'),
            };

            if (this.getValueFromFilter('unitValue', 'code')) {
              statObj.population = this.global.population;
              get100kStat(statObj, 'Cases100k', statObj, 'Cases');
            }

            res.push(statObj);
          });

          res.sort((a, b) => Date.parse(a.Date) - Date.parse(b.Date));
          res = prepareRes(res);
          return Promise.resolve(res);
        }))
        .catch((errMsg) => Promise.reject(errMsg));
    }

    graphPromise.then((value) => {
      // Тут запускаем отрисовку графика по данным value
      this.createCunstomEvent('dataForChartUpdated', { data: value });
    })
      .catch((err) => {
        console.log(`Error occured while get data for graph. ErrText: ${err}`);
      });
  }

  catchEvent(eventName, detail) {
    if (eventName === 'filterChange') this.filterChange(detail.filter);
    if (eventName.match(/countrySelect/)) this.countrySelect(detail.countryName);
  }
}
