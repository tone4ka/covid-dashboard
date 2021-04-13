import Abstract from '../abstract/abstract';
import create from '../utils/create';

// uniqueID: to be used for labels and inputs
// title: the initial visible text (pass null to display of the first element in selectOptions)
// select options: array with options (objects must include name, code)
// width: size for DOM element (a string that includes a number and px, %, rem or whatever)
// color: currently 0 for purple, 1 for orange

export default class Select extends Abstract {
  constructor(parentEl, beforeEl, uniqueID, title, selectOptions, color, classNames, ...attr) {
    super();
    this.parentContainer = parentEl;
    this.beforeElement = beforeEl;
    this.uniqueID = uniqueID;
    if (title) this.title = title;
    else this.title = selectOptions[0].name;
    this.color = color;
    this.classNames = classNames;
    this.selectOptions = selectOptions;
    this.attr = attr;

    this.elements = {
      inputs: [],
      labels: [],
    };

    this.createSelect();
  }

  createSelect() {
    this.elements.container = create('form');
    this.elements.select = create('div', '__select', null, this.elements.container, ...this.attr);
    this.elements.select.setAttribute('data-state', '');
    this.elements.selectTitle = create('div', '__select__title', null, this.elements.select);
    this.elements.selectTitle.setAttribute('data-default', this.title);
    this.elements.selectTitle.textContent = this.title;
    this.elements.selectContent = create('div', '__select__content', null, this.elements.select);
    // zero input and label won't be visible on page. Needed for correct visual performance
    this.elements.zeroInput = create('input', '__select__input', null, this.elements.selectContent,
      ['id', `${this.uniqueID}-select-default`], ['value', this.selectOptions[0].code], ['type', 'radio'], ['name', 'singleSelect']);
    this.elements.zeroLabel = create('label', '__select__label', null, this.elements.selectContent, ['for', `${this.uniqueID}-select-default`]);

    this.selectOptions.forEach((option) => {
      const currentInput = create('input', '__select__input', null, this.elements.selectContent,
        ['id', `${this.uniqueID}-select-${option.id}`], ['value', option.code], ['type', 'radio'], ['name', `singleSelect`], ['dictId', option.id]);
      if (this.color === 1) currentInput.classList.add('__select__input--secondary');
      this.elements.inputs.push(currentInput);

      const currentLabel = create('label', '__select__label', null, this.elements.selectContent, ['dictId', option.id], ['for', `${this.uniqueID}-select-${option.id}`]);
      currentLabel.textContent = option.name;
      if (this.color === 1) currentLabel.classList.add('__select__label--secondary');
      this.elements.labels.push(currentLabel);
    });

    if (this.classNames) this.elements.select.classList.add(this.classNames);
    if (this.color === 1) {
      this.elements.selectTitle.classList.add('__select__title--secondary');
      this.elements.selectContent.classList.add('__select__content--secondary');
      this.elements.zeroInput.classList.add('__select__input--secondary');
      this.elements.zeroLabel.classList.add('__select__label--secondary');
    }

    this.elements.selectTitle.addEventListener('click', () => this.toggleSelect());
    this.closeWhenSelected();

    if (this.beforeElement) {
      this.parentContainer.insertBefore(this.elements.container, this.beforeElement);
    } else {
      this.parentContainer.appendChild(this.elements.container);
    }
  }

  toggleSelect() {
    if (this.elements.select.getAttribute('data-state') === 'active') {
      this.elements.select.setAttribute('data-state', '');
    } else {
      this.elements.select.setAttribute('data-state', 'active');
    }
  }

  closeWhenSelected() {
    this.elements.labels.forEach((label) => {
      label.addEventListener('click', (evt) => {
        this.elements.selectTitle.textContent = evt.target.textContent;
        this.elements.select.setAttribute('data-state', '');
        this.createCunstomEvent('filterChangeFromSelect', {
          dict: {
            name: this.elements.select.dataset.dict,
            id: evt.target.dataset.dictId,
          },
          source: this.elements.select.dataset.source,
        });
      });
    });
  }

  selectById(id) {
    const res = this.selectOptions.find((el) => el.id === parseInt(id, 10));
    this.elements.selectTitle.textContent = res.name;
  }

  setHorizontalMargin(size) {
    this.elements.container.style.margin = `${size}px`;
    return this;
  }

  catchEvent(eventName, detail) {
    // if (eventName.match(/filterChange/)) this.filterChange(detail.filter, detail.source);
  }
}
