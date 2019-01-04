import { Watcher } from "./watcher";
import Kue from "./kue";

enum NodeType {
  ElementNode = 1,
  TextNode = 3
}

export class Compile {
  constructor(el, vm: object) {
    this.$vm = vm;
    this.$el = Compile.isElementNode(el) ? el : document.querySelector(el);

    if (this.$el) {
      this.$fragment = Compile.node2Fragment(this.$el);
      this.init();
      this.$el.appendChild(this.$fragment);
    }
  }

  private static isElementNode(node: Node): boolean {
    return node.nodeType === NodeType.ElementNode;
  }

  private static isTextNode(node: Node): boolean {
    return node.nodeType === NodeType.TextNode;
  }

  private static node2Fragment(el: HTMLElement): DocumentFragment {
    const fragment = document.createDocumentFragment();
    let child: Node;
    
    // 语句的返回值作为判断条件 这里就是赋值语句 而不是===判等
    while(child = el.firstChild) {
      fragment.appendChild(child);
    }

    return fragment;
  }

  private init(): void {
    this.compileElement(this.$fragment as any);
  }

  private compileElement(el: Element): void {
    const chilNodes = el.childNodes;
    const _this = this;

    [].slice.call(chilNodes).forEach((node: Element) => {
      const text = node.textContent;
      
      if (Compile.isElementNode(node)) {
        _this.compile(node);
      } else if (Compile.isTextNode(node) && Compile.expressionReg.test(text)) {
        _this.compileText(node, RegExp.$1);
      }

      // 遍历子节点
      if (node.childNodes && node.childNodes.length) {
        _this.compileElement(node);
      }

    });
  }

  private compileText(node: Element, text: string): void {
    CompileUtils.text(node, this.$vm, text);
  }

  private compile(node: Element): void {
    const nodeAttrs = node.attributes;
    const _this = this;

    [].slice.call(nodeAttrs).forEach((attr: Attr) => {
      // 指令以 k-xxx 命名
      // 例如 <div k-text="zglit"></div> 其中 k-text 就是指令
      const attrName = attr.name;

      if (Compile.isDirective(attrName)) {
        const exp = attr.value;
        const directive = attrName.substring(2);

        if (Compile.isEventDirective(directive)) {
          // 事件指令
          CompileUtils.eventHandler(node, _this.$vm, exp, directive);
        } else {
          // 普通指令
          CompileUtils[directive] && CompileUtils[directive](node, _this.$vm, exp);
        }

        // 清除
        node.removeAttribute(attrName);
      }
    });

  }

  private static isEventDirective(directive: string): boolean {
    return directive.indexOf('on') === 0;
  }

  private static isDirective(attrName: string): boolean {
    return attrName.indexOf('k-') === 0;
  }

  // 表达式文本
  static expressionReg: RegExp;

  private $vm: object;
  private $el: HTMLElement;
  private $fragment: DocumentFragment;
}

Compile.expressionReg = /\{\{(.*)\}\}/;

class CompileUtils {
  static text(node: Node, vm: object, exp: string): void {
    this.bind(node, vm, exp, 'text');
  }

  static html(node: Node, vm: object, exp: string): void {}

  static model(node: Node, vm: object, exp: string): void {
    this.bind(node, vm, exp, 'model');

    const _this = this;
    let val = CompileUtils.getVMVal(vm, exp) as any;
    node.addEventListener('input', (ev: KeyboardEvent) => {
      const newValue = (ev.target as HTMLInputElement).value;
      if (val === newValue) {
        return;
      }  

      _this.setVMVal(vm, exp, newValue);
      val = newValue;
    });

  }

  static className(node: Node, vm: object, exp: string): void {}

  static bind(node: Node, vm: object, exp: string, directive: string): void {
    const updaterFn = Updater[directive + 'Updater'];

    updaterFn && updaterFn(node, CompileUtils.getVMVal(vm, exp));

    new Watcher(vm, exp, (value, oldValue) => {
      updaterFn && updaterFn(node, value, oldValue);
    });
  }

  static eventHandler(node: Node, vm: any, exp: string, directive: string): void {
    const eventType = directive.split(':')[1];
    const fn = vm.$options.methods && vm.$options.methods[exp];

    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false);
    }
  }

  private static getVMVal(vm: object, exp: string): object {
    let val = vm;
    let exps = exp.split('.');
    exps.forEach((key:string) => val = val[key]);
    return val;
  }

  private static setVMVal(vm: object, exp: string, value: string): void {
    let val = vm;
    let exps = exp.split('.');
    exps.forEach((k: string, i: number) => {
        // 非最后一个key，更新val的值
        if (i < exps.length - 1) {
            val = val[k];
        } else {
            val[k] = value;
        }
    });
  }
}

class Updater {
  static textUpdater(node: Node, value: string): void {
    node.textContent = typeof value === 'undefined'
      ? ''
      : value;
  }

  static htmlUpdater(node: Node, value: string): void {
    (node as Element).innerHTML = typeof value === 'undefined'
      ? ''
      : value;
  }

  static classNameUpdater(node: Node, value: string): void {}

  static modelUpdater(node: Node, value: string): void {
    (node as HTMLInputElement).value = typeof value === 'undefined'
      ? ''
      : value;
  }
}