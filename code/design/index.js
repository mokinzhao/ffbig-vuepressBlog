/*
 * @Author: mokinzhao
 * @Date: 2021-03-30 20:37:11
 * @Description:常见设计模式
 */

//SingleIntance-函数单例（闭包）
var Singleton = function (name) {
  this.name;
};
Singleton.prototype.getName = function () {
  alert(this.name);
};
//利用闭包特性创建单例，同时符合惰性单例的特性
Singleton.getInstance = (function (name) {
  var instance;
  return function (name) {
    if (!instance) {
      instance = new Singleton(name);
    }
  };
})();
var a = Singleton.getInstance("seven1");
var b = Singleton.getInstance("seven2");

console.log(a === b); //true
