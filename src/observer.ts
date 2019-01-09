import { Watcher } from "./watcher";

export interface IListener {
  update: Function;
}

export class Observer {
  static observe(data: object): object {
    if (typeof(data) !== 'object') {
      return;
    }

    return new Observer(data);
  }

  private static observify(data: object, key: string, value: object): void {
    // 递归observity子属性
    Observer.observe(value);

    /**
     * 每一个被observify的属性 都对应自己的一个Dispatcher实例 存储在此闭包中
     * 每个dispatcher都有唯一的id
     * 当这个被obserfity的属性被重新赋值时 值的变化就被set方法所劫持到
     * 然后根据dispatcher.notify通知到dispatcher上所添加的监听器
     */
    const dispatcher = new Dispatcher();

    Object.defineProperty(data, key, {
      get() {

        // TODO 这是一个很神奇的操作
        if (Dispatcher.target) {
          dispatcher.depend();
        }

        return value;
      },
      set(newValue) {
        if (newValue === value) return;

        value = newValue;
        console.log(`new value: ${newValue}`);

        // 对为object的新值重新observe
        Observer.observe(newValue);

        // 通知订阅者
        dispatcher.notify();

      },
      configurable: false,
      enumerable: true
    });
  }

  constructor(data: object) {
    this.data = data;
    this.walk(data);
  }

  private data: object;

  // 遍历源对象 递归地修改它们的属性为访问器属性
  private walk(data: object): void {
    Object.keys(data).forEach((key: string) => {
      const value = data[key];
      Observer.observify(data, key, value);
    });
  }

}

export class Dispatcher {
  static target: Watcher;
  static uid: number;

  id: number;

  constructor() {
    this.subscribers = [];
    this.id = Dispatcher.uid++;
  }

  addSubscriber(callback: IListener): void {
    this.subscribers.push(callback);
  }

  depend(): void {
    Dispatcher.target.addDep(this);
  }

  notify(): void {
    this.subscribers.forEach(c => c.update());
  }

  private subscribers: IListener[];
}

Dispatcher.uid = 0;
Dispatcher.target = null;