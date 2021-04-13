/**
 * @param {String} el
 * @param {String} classNames
 * @param {HTMLElement} child
 * @param {HTMLElement} parent
 * @param  {...array} dataAttr
 */

// dataAttr: [code, value], [code, value]
export default function create(el, classNames, child, parent, ...dataAttr) {
  let element = null;
  try {
    element = document.createElement(el);
  } catch (e) {
    throw new Error('Unable to create HTMLElemebnt! Give a correct tag name');
  }

  if (classNames) element.classList.add(...classNames.split(' '));

  if (child && Array.isArray(child)) {
    child.forEach((childElem) => {
      childElem && element.appendChild(childElem);
    });
  } else if (child && typeof child === 'object') {
    element.appendChild(child);
  } else if (child && typeof child === 'string') {
    element.innerHTML = child;
  }

  if (parent) parent.appendChild(element);

  if (dataAttr.length) {
    dataAttr.forEach(([attrName, attrValue]) => {
      if (attrValue === '') {
        element.setAttribute(attrName, '');
      } else if (attrName.toString().match(/value|id|placeholder|cols|rows|autocorrect|spellcheck|src/)) {
        element.setAttribute(attrName, attrValue);
      } else {
        element.dataset[attrName] = attrValue;
      }
    });
  }

  return element;
}
