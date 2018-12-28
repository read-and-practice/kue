
interface IListener {
  update: Function;
}

class ListenerBase extends Function implements IListener {
  update(...args): void {}
}

class Observer {
  static observe(data: object): void {
    if (typeof(data) !== 'object') {
      return;
    }

    Observer.observify(data);
  }

  private static observify(data: object): void {
    Object.keys(data).forEach((key: string) => {
      let value = data[key];

      if (typeof(value) === 'object') {
        Observer.observe(value);
      }

      Object.defineProperty(data, key, {
        get() {
          return value;
        },
        set(v) {
          if (v === value) return;
          value = v;
          console.log(`new value: ${v}`);
        },
        configurable: false,
        enumerable: true
      });
    });
  }
}

class Dispatcher {

  constructor() {
    this.subscribers = {};
  }

  addSubscriber(channel: string, callback: ListenerBase): void {
    this.ensureChannel(channel);
    this.subscribers[channel].push(callback);
  }

  notify(channel: string, ...args): void {
    const callbacks = this.subscribers[channel];
    if (callbacks) {
      callbacks.forEach(c => c.update(...args));
    }
  }

  private subscribers: {[channel: string]: ListenerBase[]}

  private ensureChannel(channel: string): void {
    if (!this.subscribers[channel]) {
      this.subscribers[channel] = [];
    }
  }
  

}