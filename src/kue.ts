import { Compile } from './compile';
import { Observer } from './observer';

interface Options {
  data: object;
  el: any;
}

export default class Kue {
  constructor(options: Options) {
    this.$options = options || {};
    const data = this._data = options.data;

    Object.keys(data).forEach((key: string) => {
      this.proxyData(key);
    });

    this.initComputed();

    Observer.observe(data);

    this.$compile = new Compile(options.el || document.body, this);
  }


  $watch(): void {

  }

  $compile;

  $options: any;

  private _data;

  private proxyData(key: string): void {
    Object.defineProperty(this, key, {
      get() {
        return this._data[key];
      },
      set(value) {
        this._data[key] = value;
      },
      enumerable: true,
      configurable: false,
    });
  }

  private initComputed(): void {

  }

}

