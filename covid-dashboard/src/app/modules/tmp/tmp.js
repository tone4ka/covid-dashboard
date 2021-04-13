import utils from '../utils/utils';
import Abstract from '../abstract/abstract';

export default class Tmp extends Abstract {
  constructor() {
    super();
    return this;
  }

  exapleEvent(detail) {
    console.log(`module: Tmp; Catch event from somwhere with text: ${detail.text}`);
  }

  catchEvent(eventName, detail) {
    if (eventName.match(/exapleEvent/)) this.exapleEvent(detail);
  }
}
