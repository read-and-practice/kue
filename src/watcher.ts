import { Dispatcher, IListener } from "./observer";

export class Watcher implements IListener {
  constructor(vm: object, expOrFn, callback: Function) {
    this.callback = callback;
    this.vm = vm;
    this.expOrFn = expOrFn;
    this.dispatcherIds = {};

    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else {
      this.getter = this.parserGetter(expOrFn);
    }

    this.value = this.get();
  }
  
  addDep(dispatcher: Dispatcher): void {
    if (this.dispatcherIds.hasOwnProperty(dispatcher.id) === false) {
      dispatcher.addSubscriber(this);
      this.dispatcherIds[dispatcher.id] = true;
    }
  }

  update(): void {
    this.run();
  }

  private run(): void {
    const value = this.get();
    const oldValue = this.value;
    if (value !== oldValue) {
      this.value = value;
      this.callback.call(this.vm, value, oldValue);
    }
  }

  private get() {
    // TODO 这也很神奇
    Dispatcher.target = this;
    const value = this.getter.call(this.vm, this.vm);
    Dispatcher.target = null;
    return value;
  }

  private parserGetter(exp: string): Function {
    if (/[^\w.$]/.test(exp)) return;

    const exps = exp.split('.');

    return function(obj: object) {
      for(let i = 0, len = exps.length; i< len; i++) {
        if (!obj) return;
        obj = obj[exps[i]];
      }
      return obj;
    }
  }

  private callback: Function;
  private vm: object;
  private expOrFn: any;
  private dispatcherIds: {[id: string]: boolean};

  private value;
  private getter: Function;
}