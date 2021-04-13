export default class Status {
  constructor(code, note) {
    // -1 - ошибка при обращении к Api
    //  0 - ошибка, но данные взщяли из LocalStorage;
    //  1 - все ок, данные из запроса
    //  2 - данные за тот же день, взяли из LocalStorage
    this.code = code;
    this.note = note;
    return this;
  }
}
