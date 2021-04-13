import create from '../utils/create';

export default class OnlineTest {
  constructor(btn) {
    this.parentElem = document.body;
    this.btn = btn;

    this.btn.addEventListener('click', () => this.createTest());
  }

  getResult() {
    this.checks = document.querySelectorAll('.test');
    let cold = 0;
    let warn = 0;
    let aht = 0;
    this.checks.forEach((item) => {
      if (item.checked === true) {
        if (item.value === 'coldArr') cold += 1;
        if (item.value === 'warningArr') warn += 1;
        if (item.value === 'ahtungArr') aht += 1;
      }
    });
    let res = '';
    if (cold + warn + aht === 0) res = 'You are healthy!';
    else if (cold > 0 && ((warn < 2 && aht === 0) || (warn === 0 && aht > 0))) res = 'You may have a cold or an acute respiratory infection, see your doctor!';
    else if (warn + cold > 1 && aht === 0) res = 'Сhances are that you are sick with covid-19. See a doctor.';
    else if (warn + cold > 0 && aht > 0) res = 'Your symptoms are consistent with typical manifestations of covid-19. We recommend that you see a doctor immediately!';
    else if (warn + cold === 0 && aht > 0) res = 'Your symptoms correspond to some serious medical conditions other than covid-19. We recommend that you consult a doctor.';
    else res = 'Your symptoms correspond to some medical conditions other than covid-19, see your doctor!';
    this.formBox.innerHTML = '';
    create('h3', 'res', res, this.formBox);
    this.close = create('button', 'сlose close-res', 'Close', this.formBox);
    this.close.addEventListener('click', () => { this.main.remove(); document.body.children[0].remove(); });
  }

  createTest() {
    const bodyBlackout = create('div', 'blackout', null, document.body);
    document.body.prepend(bodyBlackout);
    bodyBlackout.style.zIndex = '12000';
    bodyBlackout.addEventListener('click', () => {
      this.main.remove();
      document.body.children[0].remove();
    });

    this.main = create('div', 'onlineTest', null, this.parentElem);
    this.formBox = create('div', 'formBox', null, this.main);
    create('h3', 'test-title', 'Do you have any of the listed symptoms?', this.formBox);
    this.questionForm = create('form', 'questionsForm', null, this.formBox);
    const coldArr = [' runny nose', ' sore throat', ' headache'];
    const warningArr = [' a low-grade fever that gradually increases in temperature', ' a cough that gets more severe over time', ' fatigue', ' chills', ' muscle aches and pains', ' diarrhoea'];
    const ahtungArr = [' loss of taste', ' loss of smell', ' shortness of breath', ' persistent pain or pressure in the chest'];

    for (let i = 0; i < coldArr.length; i += 1) {
      const formP = create('div', 'question-wrap', null, this.questionForm);
      create('input', 'test', null, formP, ['type', 'checkbox'], ['value', 'coldArr']);
      create('span', null, coldArr[i], formP);
    }
    for (let i = 0; i < warningArr.length; i += 1) {
      const formP1 = create('div', 'question-wrap', null, this.questionForm);
      create('input', 'test', null, formP1, ['type', 'checkbox'], ['value', 'warningArr']);
      create('span', null, warningArr[i], formP1);
    }
    for (let i = 0; i < coldArr.length; i += 1) {
      const formP2 = create('div', 'question-wrap', null, this.questionForm);
      create('input', 'test', null, formP2, ['type', 'checkbox'], ['value', 'ahtungArr']);
      create('span', null, ahtungArr[i], formP2);
    }
    this.controlPan = create('div', 'controlPan', null, this.formBox);
    this.ready = create('button', 'ready', 'Ready', this.controlPan);
    this.close = create('button', 'сlose', 'Close', this.controlPan);
    this.ready.addEventListener('click', () => this.getResult());
    this.close.addEventListener('click', () => { this.main.remove(); document.body.children[0].remove(); });
  }
}
