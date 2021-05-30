---
title: JavaScript之基础函数
---

## JavaScript 之基础函数

- Call

```js
/**- 简易版（不考虑 context 非对象情况，不考虑 Symbol\BigInt 不能 new.constructor( context )情况）
 * context: 要改变的函数中的this指向，写谁就是谁
 * args：传递给函数的实参信息
 * this：要处理的函数 fn
 */
Function.prototype.call = function (context, ...args) {
  //null,undefined,和不传时,context 为window
  context = context = null ? window : context;
  let result;
  context["fn"] = this; //把函数作为对象的某个成员值
  result = context["fn"](...args);
  delete context["fn"];
  return result;
};
```

```js
/**- 简易版（不考虑 context 非对象情况，不考虑 Symbol\BigInt 不能 new.constructor( context )情况）
 * context: 要改变的函数中的this指向，写谁就是谁
 * args：传递给函数的实参信息
 * this：要处理的函数 fn
 */
Function.prototype.call = function (context, ...args) {
  //  null，undefined，和不传时，context为 window
  context = context == null ? window : context;
  // 必须保证 context 是一个对象类型
  let contextType = typeof context;
  if (!/^(object|function)$/i.test(contextType)) {
    // context = new context.constructor(context); // 不适用于 Symbol/BigInt
    context = Object(context);
  }
  let result;
  context["fn"] = this; // 把函数作为对象的某个成员值
  result = context["fn"](...args); // 把函数执行，此时函数中的this就是
  delete context["fn"]; // 设置完成员属性后，删除
  return result;
};
```

- Apply

```js
Function.prototype.apply = function (context, arr) {
  var context = context || window;
  context.fn = this;
  var args = [];
  var result;
  if (!arr) {
    result = context.fn();
  } else {
    var args = [];
    for (let index = 0; index < arr.length; index++) {
      args.push(arr(i));
    }
    result = eval("context.fn(" + args + ")");
  }
  delete context.fn;
  return result;
};
```

- Bind

```js
//bind实现版本一
Function.prototype.mybind = function (context, ...args) {
  return (...newArgs) => {
    return this.call(context, ...args, newArgs);
  };
};
// bind实现版本二
// 使用 call / apply 指定 this
// 返回一个绑定函数
// 当返回的绑定函数作为构造函数被new调用，绑定的上下文指向实例对象
// 设置绑定函数的prototype 为原函数的prototype

Function.prototype.mybind2 = function (context, ...args) {
  const fn = this;
  const bindFn = function (...newFnArgs) {
    return fn.call(
      this instanceof bindFn ? this : context,
      ...args,
      ...newFnArgs
    );
  };
  bindFn.prototype = Object.create(fn.prototype);
  return bindFn;
};
```

- New

```js
Function.prototype.myNew = function () {
  //创建一个实例对象
  var obj = new Object();
  //取得外部传入得构造器
  var Constructor = Array.prototype.shift.call(arguments);
  //实现继承，实例可以访问构造器得属性
  obj.__proto__ = Constructor.prototype;
  //调用构造器，并改变其this 指向到实例
  var ret = Constructor.apply(obj, arguments);
  // 如果构造函数返回值是对象原则返回这个对象，如果不是对象则返回新的实例对象
  return typeof ret === "object" ? ret : obj;
};
```

- Object.create

```js
function create(proto) {
  function Fn() {}
  Fn.prototype = proto;
  Fn.prototype.constructor = Fn;
  return new Fn();
}
let demo = {
  c: "123",
};

let cc = Object.create(demo);
```

- Object.is

Object.is 解决主要这两个问题：

```js
+0 === -0; // true
NaN === NaN; // false
```

```js
const is = (x, y) => {
  if (x === y) {
    //+0和-0应该不相等
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  } else {
    return x !== x && y !== y;
  }
};
```

- Object.assign()
