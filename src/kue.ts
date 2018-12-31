import { Compile } from './compile';

export * from './observer';

interface Options {
  data: object;
  el: any;
}

export default class Kue {
  constructor(options: Options) {
    this.$options = options || {};
    const data = this._data = options.data;
    const _this = this;

    Object.keys(data).forEach((key: string) => {
      _this.proxyData(key);
    });

    this.initComputed();

    this.$compile = new Compile(options.el || document.body, this);
  }


  $watch(): void {

  }

  $compile;

  $options: any;

  private _data;

  private proxyData(key: string): void {
    const _this = this;

    Object.defineProperty(this, key, {
      get() {
        return _this._data[key];
      },
      set(value) {
        _this._data[key] = value;
      },
      enumerable: true,
      configurable: false,
    });
  }

  private initComputed(): void {

  }

}

