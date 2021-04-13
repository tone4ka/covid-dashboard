import utils from '../utils/utils';
import Abstract from '../abstract/abstract';
import DataModel from '../dataModel/dataModel';
import Graph from '../graph/graph';
import List from '../list/list';
import Map from '../map/map';
import Table from '../table/table';
import FullScreenPopup from '../fullscreenPopup/fullscreenPopup';
import OnlineTest from '../online-test/onlineTest';

import '../../../assets/rs-school-js.svg';

export default class Main extends Abstract {
  constructor() {
    super();
    this.generateLayout();
    this.main = {};
    this.dataModel = new DataModel(this.loadData, this.loadDaraFail);

    const dataPromise = this.dataModel.initData();
    this.graph = new Graph(this.elements.right.graph, this.dataModel);
    this.map = new Map(this.elements.center.map, this.dataModel);

    dataPromise
      .then((res) => this.dataLoaded(res))
      .catch((res) => this.dataLoadFailed(res));

    document.body.prepend(this.elements.main);
    this.map.drowMapSheet();
    return this;
  }

  generateLayout() {
    const { create } = utils;
    this.elements = {};
    this.elements.main = create('div', 'container');
    this.elements.header = create('header', 'header', null, this.elements.main);
    this.elements.logoWrap = create('div', 'header__logo-wrap',
      [create('div', 'header__logo', '<img src="assets/logo.png" alt="logo">'),
        create('h1', 'header__title', 'COVID-19 DASHBOARD', null)], this.elements.header);
    this.elements.covidTestBtn = create('button', 'header__covid-test-btn', 'Online COVID-19 Test', this.elements.header);
    this.onlineTest = new OnlineTest(this.elements.covidTestBtn); // !

    const main = create('main', 'main', null, this.elements.main);

    this.elements.left = {};
    const { left } = this.elements;
    const mainLeft = create('div', 'main-left', null, main);

    const globalCases = create('section', 'global-cases', null, mainLeft);
    left.globalTitle = create('h2', 'global-cases__title', null, globalCases);
    left.globalValue = create('p', 'global-cases__text', null, globalCases);
    this.elements.globalCasesPopup = new FullScreenPopup(globalCases);

    left.countriesGeneral = create('section', 'countries-general',
      create('h2', 'countries-general__title', 'List', null), mainLeft);
    this.elements.countriesGeneralPopup = new FullScreenPopup(left.countriesGeneral);

    const lastUpdate = create('section', 'last-update',
      create('h2', 'last-update__header', 'Last Update', null), mainLeft);
    left.lastUpdate = create('p', 'last-update__date', null, lastUpdate);
    this.elements.lastUpdatePopup = new FullScreenPopup(lastUpdate);

    this.elements.center = {};
    const mainCenter = create('div', 'main-center', null, main);
    const { center } = this.elements;
    center.map = create('section', 'map', null, mainCenter);
    this.elements.mapPopup = new FullScreenPopup(center.map);
    this.elements.footer = create('footer', 'footer', null, mainCenter);
    const footerInner = create('div', 'footer__inner', null, this.elements.footer);
    const footerCourseLink = create('a', 'footer__course-link', null, footerInner, ['href', 'https://rs.school/js/'], ['target', '_blank']);
    footerCourseLink.innerHTML = '<img src="assets/rs-school-js.svg" style = "width: 60px; height: auto" alt="RS School logo">';
    const footerAuthorsInfo = create('div', 'footer__authors-info', null, footerInner);
    const authorsInfo = ['f19m', 'tone4ka', 'milanaadams'];
    authorsInfo.forEach((name) => { create('a', 'footer__authors-link', name, footerAuthorsInfo, ['href', `https://github.com/${name}`], ['target', '_blank']); });

    this.elements.right = {};
    const mainRight = create('div', 'main-right', null, main);
    const { right } = this.elements;
    right.table = create('section', 'table', null, mainRight);
    right.graph = create('section', 'graph', null, mainRight);
    this.elements.tablePopup = new FullScreenPopup(right.table);
    this.elements.graphPopup = new FullScreenPopup(right.graph);
  }

  initTitles() {
    const getTitleText = () => {
      const resText = [];
      resText.push(this.dataModel.getValueFromFilter('unitPeriod', 'code'));
      resText.push('Global');
      resText.push(this.dataModel.getValueFromFilter('indicators', 'name'));
      resText.push(this.dataModel.getValueFromFilter('unitValue', 'code'));

      return resText.join(' ');
    };

    const getTitleValue = () => {
      const indicatorName = this.dataModel.getValueFromFilter('unitPeriod', 'code')
                  + this.dataModel.getValueFromFilter('indicators', 'code')
                  + this.dataModel.getValueFromFilter('unitValue', 'code');

      return this.dataModel.global[indicatorName].toLocaleString();
    };

    const dtOptions = {
      hour: 'numeric',
      hour12: true,
      minute: 'numeric',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };

    this.elements.left.globalTitle.innerHTML = getTitleText();
    this.elements.left.globalValue.innerHTML = getTitleValue();
    this.elements.left.lastUpdate.innerHTML = this.dataModel.dateParse.toLocaleString('en-US', dtOptions);
  }

  dataLoaded(res) {
    console.log(`dataPromise resolve with code:"${res.code}" and note: "${res.note}"`);
    console.log(this.dataModel);
    this.initTitles();

    const { left } = this.elements;
    this.list = new List(left.countriesGeneral, this.dataModel);

    const { right } = this.elements;
    this.table = new Table(right.table, this.dataModel);
    this.createCunstomEvent('countrySelect', { countryName: 'All' });
    this.map.createMap();
  }

  dataLoadFailed(res) {
    console.log(`dataPromise reject by error"`);
    console.log(res);
  }

  catchEvent(eventName, detail) {
    if (eventName.match(/dataUpdated/)) this.initTitles();
  }
}
