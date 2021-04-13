/*
 * @Author: mokinzhao
 * @Date: 2021-03-30 20:34:44
 * @Description: 手写基础函数
 */

//call-实现方式一
Function.prototype.call = function (context) {
  var context = context || window;
  context.fn = this;
  let args = [];
  for (let index = 0; index < arguments.length; index++) {
    args.push(arguments[i]);
  }
  context.fn(...args);
  let result = context.fn(...args);
  delete context.fn;
  return result;
};

//call-实现方式二
// 第一个参数为null或者undefined时，this指向全局对象window，值为原始值的指向该原始值的自动包装对象，如 String、Number、Boolean
// 为了避免函数名与上下文(context)的属性发生冲突，使用Symbol类型作为唯一值
// 将函数作为传入的上下文(context)属性执行
// 函数执行完成后删除该属性
// 返回执行结果
Function.prototype.call2 = function (context, ...args) {
  context = (context ?? window) || new Object(context);
  const key = Symbol();
  context[key] = this;
  const result = context[key](...args);
  delete context[key];
  return result;
};

//apply
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

//bind
//bind它并不是立马执行函数，而是有一个延迟执行的操作，就是生成了一个新的函数，需要你去执行它👇

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

Function.prototype.bind2 = function (context) {
  var self = this;
  var args = Array.prototype.slice.call(arguments, 1);
  var fNOP = function () {};
  var fBound = function (params) {
    var bindArgs = Array.prototype.slice.call(arguments);
    return self.apply(
      this instanceof fNOP ? this : context,
      args.concat(bindArgs)
    );
  };
  fNOP.prototype = this.prototype;
  fBound.prototype = new fNOP();
  return fBound;
};

//new
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

//函数柯理化
