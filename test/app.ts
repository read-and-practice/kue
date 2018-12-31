import { Dispatcher, Observer } from '../src/kue';
import Kue from '../src/kue';

console.log(Observer);
console.log(Dispatcher);

new Kue({
  data: {
    name: 123
  },
  el: document.querySelector('body')
});