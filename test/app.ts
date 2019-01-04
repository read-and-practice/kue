import { Dispatcher, Observer } from '../src/kue';
import Kue from '../src/kue';

new Kue({
  data: {
    name: 123
  },
  el: document.querySelector('body')
});