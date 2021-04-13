import create from '../utils/create';

export default class Legend {
  constructor(parent) {
    this.parent = parent;
  }

  createDataList(perSize) {
    if (this.parent.children.length > 0) {
      while (this.parent.children.length > 0) {
        this.parent.children[0].remove();
      }
    }
    this.perSize = perSize;
    const data = [];
    Object.keys(this.perSize).forEach((key) => {
      data.push(this.perSize[key]);
    });
    for (let i = 0; i < data.length; i += 1) {
      const row = create('tr', null, null, this.parent);
      row.innerHTML = `<td class="map-legend__circle-col"><span class= "map-legend__circle" style="width: ${i + 1}em; height: ${i + 1}em;"></span></td>
      <td class="map-legend__data-col">${data[i]}</td>`;
    }
  }
}
