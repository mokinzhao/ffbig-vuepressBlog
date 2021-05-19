/*
 * @Author: mokinzhao
 * @Date: 2021-04-07 13:57:00
 * @Description: js 继承
 */

/*-----------------ES5--------------------*/

//--------原型链继承--------
function Animal() {
  this.colors = ["black", "white"];
}
Animal.prototype.getColor = function () {
  return this.colors;
};

function Dog() {}
Dog.prototype = new Animal();
let dog1 = new Dog();
dog1.colors.push("brown");
let dog2 = new Dog();
console.log(dog2.colors);

//缺点：
//问题1: 原型中包含的引用类型属性将被所有实例共享
//问题2: 子类在实例化的时候不能给父类的构造函数传参

//--------借用构造函数实现继承-------
function Animal(name) {
  this.name = name;
  this.getName = function () {
    return this.getName;
  };
}

function Dog(name) {
  Animal.call(this, name);
}
Dog.prototype = new Animal();

//借用构造函数实现继承解决了原型链继承的2个问题：
//1.引用类型共享问题以及传参问题，但是由于方法必须定义在构造函数中，所以会导致每次创建子类实例都会创建一遍方法

//------------组合继承------------
//组合继承结合了原型链盗用构造函数，将两者的优点集中了起来，基本的思路是使用原型链继承原型上的属性和方法，而通过盗用构造函数继承实例属性，这样既可以把方法定义在原型上以实现重用，又可以让每个实例都有自己的属性
function Animal(params) {
  this.name = name;
  this.colors = ["black", "white"];
}
Animal.prototype.getName = function () {
  return this.name;
};
function Dog(name, age) {
  Animal.call(this, name);
  this.age = age;
}
Dog.prototype = new Animal();
Dog.prototype.constructor = Dog;

let dog1 = new Dog("奶昔", 2);
dog1.colors.push("brown");
let dog2 = new Dog("哈赤", 1);
console.log(dog2);

//-------寄生组合式继承----------

//组合式继承已经相对完善了,但还是存在问题,它的问题就是调用了2次父类构造函数，第一次是在 new Animal(),第二次是在Animal.call()这里。
//所以解决方案就是不直接调用父类原型赋值，而是通过创建空函数F 获取父类原型的副本。

//寄生式组合继承写法上和组合继承基本类似，区别是如下这里：
//-Dog.prototype = new Animal() - Dog.prototype.constructor = Dog;

//function F() {}
//F.prototype = Animal.prototype;
//let f = new F();
//F.constructor = Dog;
//Dog.prototype = f;

function object(o) {
  function F() {}
  F.prototype = o;
  return new F();
}

function inheritPrototype(child, parent) {
  let prototype = object(parent.prototype);
  prototype.constructor = child;
  child.prototype = prototype;
}

inheritPrototype();
/*-----------------ES6---------------*/
