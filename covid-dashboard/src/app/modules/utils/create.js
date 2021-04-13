export default function create(el, classNames, child, parent, ...dataAttr) {
  let element = null;
  try {
    element = document.createElement(el);
  } catch (e) {
    throw new Error('Unable to create HTMLElemebnt! Give a correct tag name');
  }

  if (classNames) element.classList.add(...classNames.split(' '));

  try {
    if (child && Array.isArray(child)) {
      child.forEach((childElem) => {
        if (childElem) {
          element.appendChild(childElem);
        }
      });
    } else if (child && typeof child === 'object') {
      element.appendChild(child);
    } else if (child && typeof child === 'string') {
      element.innerHTML = child;
    } else if (typeof child === 'number') {
      element.innerHTML = child.toString();
    }
  } catch (e) {
    throw new Error(`${e};    child = ${child};`);
  }

  if (parent) {
    parent.appendChild(element);
  }

  if (dataAttr.length) {
    dataAttr.forEach(([attrName, attrValue]) => {
      try {
        if (attrValue === '') {
          element.setAttribute(attrName, '');
        } else if (attrName && attrName.toString().match(/value|href|target|style|type|for|id|placeholder|cols|rows|autocorrect|spellcheck|src|name/)) {
          element.setAttribute(attrName, attrValue);
        } else if (attrName) {
          element.dataset[attrName] = attrValue;
        }
      } catch (e) {
        throw new Error(`${e};    dataAttr = ${dataAttr};  attrName=${attrName}  attrValue=${attrValue};`);
      }
    });
  }

  return element;
}
