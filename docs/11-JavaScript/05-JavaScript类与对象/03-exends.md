---
title: JavaScript-继承
---

## JavaScript 之继承

### 原型链继承(prototype + new)

构造函数、原型和实例之间的关系：每个构造函数都有一个原型对象，原型对象都包含一个指向构造函数的指针，而实例都包含一个原型对象的指针。

继承的本质就是复制，即重写原型对象，代之以一个新类型的实例。
![png](https://user-gold-cdn.xitu.io/2018/10/30/166c2c0107fd80c7?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

```js
function fatherFn() {
  this.some = "父类到this属性";
}

fatherFn.prototype.fatherFnSome = "父类原型对象到属性或者方法";

function sonFn() {
  this.sonName = "子类到this属性";
}
//核心步骤：重写子类到原型对象

sonFn.prototype = new fatherFn(); //将fatherFn到实例赋值给sonFn的prototype
sonFn.prototype.sonFnSome = "子类原型对象的属性或者方法"; //子类的属性/方法声明在后面，避免覆盖
//实例化子类
const sonFnInstace = new sonFn();
console.log("子类的实例", sonFnInstace);
```

![png](https://user-gold-cdn.xitu.io/2020/3/21/170fc7d0f9e3af5b?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

- 优点：
  继承了父类的模板，又继承了父类的原型对象

- 缺点：

  1.多个实例对引用类型的操作会被篡改。

  2.创建子类实例时，无法向父类构造函数传参，不够灵活

  3.无法实现多继承(因为已经指定了原型对象了)

### 借用构造函数(call)

使用父类的构造函数来增强子类实例，等同于复制父类的实例给子类（不使用原型）

```js
function SuperType() {
  this.color = ["red", "green", "blue"];
}
function SubType() {
  //继承自SuperType
  SuperType.call(this);
}
var instance1 = new Subtype();
instance1.color.push("black");
alert(instance.color); //'red',greem,blue,black
var instance2 = new SubType();
alert(instance2.color); //'red','green','blue'
```

核心代码是 SuperType.call(this)，创建子类实例时调用 SuperType 构造函数，于是 SubType 的每个实例都会将 SuperType 中的属性复制一份。

- 优点：

解决了原型链继承中子类实例共享父类引用对象的问题，实现多继承，创建子类实例时，可以向父类传递参数

- 缺点：

构造继承只能继承父类的实例属性和方法，不能继承父类原型的属性和方法
实例并不是父类的实例，只是子类的实例
无法实现函数复用，每个子类都有父类实例函数的副本，影响性能

### 组合继承 (call+new)

原理：使用原型链继承(new)将 this 和 prototype 声明的属性/方法继承至子类的 prototype 上，使用借用构造函数来继承父类通过 this 声明属性和方法至子类实例的属性上。

```js
function fatherFn(...arr) {
  this.some = "父类的this属性";
  this.params = arr; // 父类的参数
}
fatherFn.prototype.fatherFnSome = "父类原型对象的属性或者方法";
function sonFn() {
  fatherFn.call(this, "借用构造继承", "第二次调用"); // 借用构造继承: 继承父类通过this声明属性和方法至子类实例的属性上
  this.obkoro1 = "子类的this属性";
}
sonFn.prototype = new fatherFn("原型链继承", "第一次调用"); // 原型链继承: 将`this`和`prototype`声明的属性/方法继承至子类的`prototype`上
sonFn.prototype.sonFnSome = "子类原型对象的属性或者方法";
const sonFnInstance = new sonFn();
console.log("组合继承子类实例", sonFnInstance);
```

- 优点：
  完整继承(又不是不能用)，解决了：

1. 父类通过 this 声明属性/方法被子类实例共享的问题(原型链继承的问题)
2. 每次实例化子类将重新初始化父类通过 this 声明的属性，实例根据原型链查找规则，每次都会
3. 父类通过 prototype 声明的属性/方法无法继承的问题(借用构造函数的问题)。

- 缺点：

1. 两次调用父类函数(new fatherFn()和 fatherFn.call(this))，造成一定的性能损耗。
2. 因调用两次父类,导致父类通过 this 声明的属性/方法，生成两份的问题。
3. 原型链上下文丢失：子类和父类通过 prototype 声明的属性/方法都存在于子类的 prototype 上

### 原型式继承 (Object.create())

利用一个空对象作为中介，将某个对象直接赋值给空对象构造函数的原型。

Object.create

```js
function objectCreate(obj) {
  function F() {}
  F.prototype = obj;
  return new F();
}
```

```js
var person = {
  name: "Nicholas",
  friends: ["Shelby", "Court", "Van"],
};

var anotherPerson = Object.create(person);
anotherPerson.name = "Greg";
anotherPerson.friends.push("Rob");

var yetAnotherPerson = Object.create(person);
yetAnotherPerson.name = "Linda";
yetAnotherPerson.friends.push("Barbie");
```

object()对传入其中的对象执行了一次浅复制，将构造函数 F 的原型直接指向传入的对象。

- 优点：

再不用创建构造函数的情况下，实现了原型链继承，代码量减少一部分。

- 缺点：

1. 一些引用数据操作的时候会出问题，两个实例会公用继承实例的引用数据类
2. 谨慎定义方法，以免定义方法也继承对象原型的方法重名
3. 无法直接给父 9 级构造函数使用参数

### 寄生式继承 (封装继承过程)

核心：在原型式继承的基础上再封装一层，来增强对象，之后将这个对象返回。

```js
function createAnother(original) {
  var clone = object(original); // 通过调用 object() 函数创建一个新对象
  clone.sayHi = function () {
    // 以某种方式来增强对象
    alert("hi");
  };
  return clone; // 返回这个对象
}
```

函数的主要作用是为构造函数新增属性和方法，以增强函数

```js
var person = {
  name: "Nicholas",
  friends: ["Shelby", "Court", "Van"],
};
var anotherPerson = createAnother(person);
anotherPerson.sayHi(); //"hi"
```

- 优点：

再不用创建构造函数的情况下，实现了原型链继承，代码量减少一部分。

- 缺点：

1. 一些引用数据操作的时候会出问题，两个实例会公用继承实例的引用数据类
2. 谨慎定义方法，以免定义方法也继承对象原型的方法重名
3. 无法直接给父级构造函数使用参数

### 寄生组合式继承 (call+寄生式封装)

- 寄生组合式继承原理：

1. 使用借用构造函数(call)来继承父类 this 声明的属性/方法
2. 通过寄生式封装函数设置父类 prototype 为子类 prototype 的原型来继承父类的 prototype 声明的属性/方法。

```js
function inheritprototype(subType, SuperType) {
  var prototype = Object.create(subType.prototype); //创建对象，创建父类原型的一个副本
  prototype.constructor = subType; //增强对象，弥补因重写原型而失去的默认constructor属性
  subType.prototype = prototype; //指定对象，将创建的对象赋值给子类原型
}
//父类初始化实例属性和原型属性
function SuperType(name) {
  this.name = name;
  this.colors = ["red", "green", "blue"];
}
SuperType.prototype.SayName = function () {
  alert(this.name);
};
//借用构造函数传递增强子类实例属性（支持传参和避免篡改）
function SubType(name, age) {
  SuperType.call(this, name);
  this.age = age;
}

//将父类原型指向子类
inheritPrototype(SubType, SuperType);
//新增子类原型属性
SubType.prototype.sayAge = function () {
  alert(this.age);
};
var instance1 = new SubType("xyc", 23);
var instance2 = new SubType("lxy", 23);

instance1.colors.push("2"); // ["red", "blue", "green", "2"]
instance1.colors.push("3"); // ["red", "blue", "green", "3"]
```

![extends](https://user-gold-cdn.xitu.io/2018/10/30/166c2c0109df5438?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)
这个例子的高效率体现在它只调用了一次 SuperType  构造函数，并且因此避免了在 SubType.prototype  上创建不必要的、多余的属性。于此同时，原型链还能保持不变；因此，还能够正常使用 instanceof  和 isPrototypeOf()

这是最成熟的方法，也是现在库实现的方法
![](https://user-gold-cdn.xitu.io/2020/3/21/170fd2bbd607befc?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

- 寄生组合继承算是 ES6 之前一种比较完美的继承方式吧。

它避免了组合继承中调用两次父类构造函数，初始化两次实例属性的缺点。

- 所以它拥有了上述所有继承方式的优点：

1. 只调用了一次父类构造函数，只创建了一份父类属性
2. 子类可以用到父类原型链上的属性和方法
3. 能够正常的使用 instanceOf 和 isPrototypeOf 方法

### 混入方式继承(Object.assign())

```js
function MyClass() {
  SuperClass.call(this);
  OtherSuperClass.call(this);
}

// 继承一个类
MyClass.prototype = Object.create(SuperClass.prototype);
// 混合其它
Object.assign(MyClass.prototype, OtherSuperClass.prototype);
// 重新指定constructor
MyClass.prototype.constructor = MyClass;

MyClass.prototype.myMethod = function () {
  // do something
};
```

Object.assign 会把 OtherSuperClass 原型上的函数拷贝到 MyClass 原型上，使 MyClass 的所有实例都可用 OtherSuperClass 的方法。
![](https://user-gold-cdn.xitu.io/2020/3/21/170fd12e435d5d4b?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### ES6 extends 继承

extends 关键字主要用于类声明或者类表达式中，以创建一个类，该类是另一个类的子类。其中 constructor 表示构造函数，一个类中只能有一个构造函数，有多个会报出 SyntaxError 错误,如果没有显式指定构造方法，则会添加默认的 constructor 方法，使用例子如下。

```js
class Rectangle {
    // constructor
    constructor(height, width) {
        this.height = height;
        this.width = width;
    }

    // Getter
    get area() {
        return this.calcArea()
    }

    // Method
    calcArea() {
        return this.height * this.width;
    }
}

const rectangle = new Rectangle(10, 20);
console.log(rectangle.area);
// 输出 200

-----------------------------------------------------------------
// 继承
class Square extends Rectangle {

  constructor(length) {
    super(length, length);

    // 如果子类中存在构造函数，则需要在使用“this”之前首先调用 super()。
    this.name = 'Square';
  }

  get area() {
    return this.height * this.width;
  }
}

const square = new Square(10);
console.log(square.area);
// 输出 100

```

#### ES5 寄生组合式继承和 ES6 extend 的区别

- ES5 的继承：实质上是先创建子类的实例对象，再将父类的方法添加到 this 上

- ES6 的继承：先创建父类的实例对象 this,再用子类的构造函数修改 this,
  因为子类没有自己的 this 对象，所以必须先调用父类的 super()方法

### 参考

[JS 基础-完美掌握继承知识点](https://juejin.cn/post/6844903950538260494#heading-23)
[JavaScript 常用八种继承方案](https://juejin.cn/post/6844903696111763470#heading-6)
[做完这 48 道题彻底弄懂 JS 继承](https://juejin.cn/post/6844904098941108232#heading-38)
