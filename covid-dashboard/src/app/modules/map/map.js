/* eslint-disable class-methods-use-this */

import create from '../utils/create';
import Abstract from '../abstract/abstract';
import Select from '../dropdown-select/select';
import Legend from './legend';

export default class Map extends Abstract {
  constructor(parentElem, dataModel) {
    super();
    this.className = 'map';
    this.dataModel = dataModel;
    this.elements = {};
    this.elements.parent = parentElem;
    this.generateLayout();
    this.perSize = {};// сюда кладу данные для легенды
    this.perSize100K = {};
    this.legend = new Legend(this.elements.popupTable); //! ! !
  }

  markerClickHandler(event) {
    const { target } = event;
    if (!target.parentElement.classList.contains('icon-marker')) return;
    const contrName = target.parentElement.childNodes[1].innerText.split('\n')[0];
    this.createCunstomEvent('countrySelect', { countryName: contrName });
  }

  drowMapSheet() {
    this.mapBox = create('div', 'mapBox', null, this.elements.mapInner);
    this.mapSheet = create('div', 'mapSheet', null, this.mapBox);
    this.mapOptions = {
      center: [30, 10],
      zoom: 2,
    };
    this.map = new L.map(this.mapSheet, this.mapOptions);
    this.layer = L.tileLayer('https://api.mapbox.com/styles/v1/tone4ka/ckixk38nj5udw1at4rc6qt6pz/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: 'pk.eyJ1IjoidG9uZTRrYSIsImEiOiJja2l1NGxnZXMydjQ5MnlsYnJjMGtmdnA3In0.5ldaiECa7ofK34QR7SjPIQ',
    });

    this.map.addLayer(this.layer);
    this.mapSheet.addEventListener('click', (event) => this.markerClickHandler(event));
  }

  generateLayout() {
    this.elements.title = create('h2', 'map__title', 'Cases', this.elements.parent);
    const controls = create('div', 'map-header__controls', null,
      create('div', 'map-header', null, this.elements.parent));

    this.selectUnitPeriod = new Select(controls,
      null, 'table_period', null, this.dataModel.unitPeriod, 0, 'select--double',
      ['source', this.className], ['dict', 'unitPeriod']).setHorizontalMargin(10);

    this.selectUnitValue = new Select(controls,
      null, 'table_value', null, this.dataModel.unitValue, 1, 'select--double',
      ['source', this.className], ['dict', 'unitValue']).setHorizontalMargin(10);

    this.elements.legendWrap = create('div', 'map-legend', null, controls);
    this.elements.legend = create('button', 'map-legend__burger', '<span><span/>', this.elements.legendWrap);

    this.elements.legendPopup = create('div', 'map-legend__popup', null, this.elements.legendWrap);
    create('h2', 'map-legend__title', 'Legend', this.elements.legendPopup);

    this.elements.popupTable = create('table', 'map-legend__table', null, this.elements.legendPopup);

    this.elements.mapInner = create('div', 'map-inner', null, this.elements.parent);

    this.elements.legend.addEventListener('click', () => this.legendClickHandler());
  }

  legendClickHandler() {
    this.elements.legend.classList.toggle('active');
    this.elements.legendPopup.classList.toggle('map-legend__popup--active');
  }

  createMap() {
    this.elements.title.innerHTML = this.dataModel.getValueFromFilter('indicators', 'name');

    const iPer = this.dataModel.filter.unitPeriod;
    const iInd = this.dataModel.filter.indicators;
    const iVal = this.dataModel.filter.unitValue;
    const namePer = this.dataModel.unitPeriod[iPer].code;
    const nameInd = this.dataModel.indicators[iInd].code;
    const nameVal = this.dataModel.unitValue[iVal].code;
    const name = `${namePer}${nameInd}${nameVal}`;

    const iconsOld = document.querySelectorAll('.icon-marker');
    if (iconsOld.length > 0)iconsOld.forEach((el) => el.remove());

    const data = Object.values(this.dataModel.statistic);

    const hasData = Array.isArray(data) && data.length > 0;
    if (!hasData) return;

    const geoJson = {
      type: 'FeatureCollection',
      features: data.map((country) => {
        const { lat } = country;
        const { long } = country;
        return {
          type: 'Feature',
          properties: {
            ...country,
          },
          geometry: {
            type: 'Point',
            coordinates: [long, lat],
          },
        };
      }),
    };

    const geoJsonLayers = new L.GeoJSON(geoJson, {
      pointToLayer: (feature, latlng) => {
        const { properties } = feature;
        const count = properties[name];
        const country = properties.Country;

        const html = `
          <span class="icon-marker">
            <span class="icon-marker-tooltip">
              <h2>${country}</h2>
              <ul>
                <li> ${name}: ${count}</li>
              </ul>
            </span>
            <span class="opacity">${count}</span>
          </span>
        `;

        return L.marker(latlng, {
          icon: L.divIcon({
            className: 'icon',
            html,
          }),
          riseOnHover: true,
        });
      },
    });
    geoJsonLayers.addTo(this.map);

    const icons = document.querySelectorAll('.icon-marker');

    // делаю для показателей на 100к диаметр поменьше, иначе они всю карту накрывают
    const maxDiameter = (this.dataModel.filter.unitValue === 1) ? 4 : 6;

    let maxSize = +icons[0].innerText; // в маркерах невидимая цифра показателя
    for (let i = 1; i < icons.length; i += 1) {
      if (+icons[i].innerText > maxSize) maxSize = +icons[i].innerText;
    }
    icons.forEach((el) => {
      const key = el;
      const sizeMark = +el.innerText;
      key.style.width = `${Math.ceil((sizeMark / maxSize) * maxDiameter)}em`;
      key.style.height = `${Math.ceil((sizeMark / maxSize) * maxDiameter)}em`;
    });

    // считаю размеры для легенды
    function getRound(x) {
      const zeroCount = Math.ceil(Math.log(x) / Math.log(10)) - 1;
      const firstNumb = +((x).toString()[0]);
      return (firstNumb * 10 ** zeroCount);
    }
    if (this.dataModel.filter.unitValue === 1) {
      const minSize100k = Math.ceil(maxSize / 4);
      this.perSize100K.em1 = `< ${getRound(minSize100k)}`;
      this.perSize100K.em2 = `${getRound(minSize100k)}...${getRound(minSize100k * 2)}`;
      this.perSize100K.em3 = `${getRound(minSize100k * 2)}...${getRound(minSize100k * 3)}`;
      this.perSize100K.em4 = `> ${getRound(minSize100k * 3)}`;
      this.legend.createDataList(this.perSize100K);
    } else {
      const minSize = Math.ceil(maxSize / 10);
      this.perSize.em1 = `< ${getRound(minSize)}`;
      this.perSize.em2 = `${getRound(minSize)}...${getRound(minSize * 2)}`;
      this.perSize.em3 = `${getRound(minSize * 2)}...${getRound(minSize * 3)}`;
      this.perSize.em4 = `${getRound(minSize * 3)}...${getRound(minSize * 4)}`;
      this.perSize.em5 = `${getRound(minSize * 4)}...${getRound(minSize * 5)}`;
      this.perSize.em6 = `> ${getRound(minSize * 5)}`;
      this.legend.createDataList(this.perSize);
    }
  }

  catchEvent(eventName, detail) {
    if (eventName.match(/mapFullScreen/)) { this.drowMapSheet(); this.createMap(); }
    if (eventName.match(/dataUpdated/)) this.createMap();
    if (eventName === 'filterChange') this.filterChange(detail.filter, detail.source);
    if (eventName === 'filterChangeFromSelect') this.filterChangeFromSelect(detail.dict, detail.source);
  }
}
