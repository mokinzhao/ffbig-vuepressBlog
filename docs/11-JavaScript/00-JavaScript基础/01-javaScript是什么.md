---
title: JavaScript是什么
---

### JavaScript 是什么

引用《JavaScript 高级程序设计第四版》中说的话 ——“从简单的输入验证脚本到强大的编程语言，JavaScript 的崛起没有任何人预测到。它很简单，学会用只要几分钟；它又很复杂，掌握它要很多年。要真正学好用好 JavaScript，理解其本质、历史及局限性是非常重要的”。
面试官：JavaScript 是什么？

我：em... JavaScript 就是 JavaScript... 👀

试想一下，如果面试官问你：JavaScript 是个啥？你会怎么回答呢？说实话，听到这个问题的时候我的脑子是有一瞬间是空白的。我们学了这么久的前端，连最简单的 “JavaScript 是什么？” 这个问题都不能跟面试官马上说出个所以然。今天我们就这个问题来聊一聊，当面试官问你 JavaScript 是什么的时候，你可以从哪几个点切入，尽可能说多、说全并且给面试官留下一个好印象。

#### JavaScript 的定位是什么？

##### 1.JavaScript 是脚本编程语言

为什么是脚本编程语言呢？我们先来简单看看关于 JavaScript 问世的风风雨雨，一句话带过就是，1995 年网景公司为了解决 页面中简单的表单验证时客户端和服务端通信时延 推出了的一款叫做 JavaScript 的客户端脚本语言并且在当时取得了很大的成果，这时微软决定向 IE 投入更多资源，针对性推出 JScript，再到 Ecma （欧洲计算机制造商协会）推出 ECMAScript （发音为 “ek-ma-script”）国际标准化了两门语言，来解决两个版本并存问题。
脚本语言能干啥呢？它可以在网页上实现复杂的功能，包括操作页面中的 DOM 元素、CSS 样式，能实现交互式的地图，2D/3D 动画，滚动播放的视频等等。JavaScript 在它所在的宿主环境中具有非常强大且灵活的能力，给开发人员提供了更多的可能性。

##### 2.JavaScript 是弱类型语言

这意味着变量可以被隐式地转换为另一个类型。类型的隐藏转换，给 JavaScript 带了了一定的灵活性，但是也增加了规则的复杂度与发生错误的可能性。
二元运算符 + 会把两个操作数转换为字符串，除非两个操作数都为数字类型。这是因为 + 也可以用来连接字符串。
二元操作符 - 会把两个操作数转换为数字类型。
一元操作符，包括 + 和 -，都会把操作数转换为数字。

```js
console.log(1 + "2" === "12");
// true
console.log("3" - "1" === 2);
// true
console.log(+"1" === 1);
// true
console.log(-"1" === -1);
// true
```

##### 3.JavaScript 是动态类型的

正如大部分脚本语言，其类型与值而不是与变量关联。例如变量可以为数值，随后又可被赋值为字符串。

```js
let a = 233
a = '弹铁蛋同学'
console.log(a)
// '弹铁蛋同学'
复制代码
可以在运行时直接执行 Javascript 语句
eval("console.log('弹铁蛋同学')")
// '弹铁蛋同学'
```

##### 4.JavaScript 是单线程的

JavaScript 需要和页面进行交互，操作 DOM 等，如果是多线程的话，会带来很复杂的同步问题。比如，假定 JavaScript 同时有两个线程，一个线程在某个 DOM 节点上添加内容，另一个线程删除了这个节点，这时浏览器应该以哪个线程为准？所以这决定了它只能是单线程，

##### 5.JavaScript 解释型语言

解释型语言（英语：Interpreted language）是一种编程语言类型。这种类型的编程语言，会将代码一句一句直接运行，不需要像编译型语言（Compiled language）一样，经过编译器先行编译为机器代码，之后再运行。

##### 6.JavaScript 具有良好的跨平台性

跨平台特性，在绝大多数浏览器的支持下，可以在多种平台下运行（如 Windows、Linux、Mac、Android、iOS 等）。

#### JavaScript 和 ECMAScript 有什么区别，以及和 DOM 、BOM 的关系？

首先简单概括 ECMAScript、 DOM 、BOM 三者概念吧。

##### 1.DOM

DOM（文档对象模型），提供了与网页内容交互的 方法 和 接口。 DOM 将整个页面抽象为一组分层节点。HTML 或 XML 页面的每个组成部分都是一种节点，包含不同的数据。DOM 通过创建表示文档的树，让开发者可以随心所欲地控制网页的内容和结构。使用 DOM API，可以轻松地删除、添加、替换、修改节点。

```html
<html>
  <head>
    <title>Sample Page</title>
  </head>
  <body>
    <p>Hello World!</p>
  </body>
</html>
```

##### 2.BOM

BOM（浏览器对象模型），提供了与浏览器交互的 方法 和 接口。 BOM 主要针对浏览器窗口和子窗口 (frame)。使用 BOM，开发者可以操控浏览器显示页面之外的部分， 比如：

1）弹出新浏览器窗口的能力；2）移动、缩放和关闭浏览器窗口的能力；3）navigator 对象，提供关于浏览器的详尽信息；4）location 对象，提供浏览器加载页面的详尽信息；5）screen 对象，提供关于用户屏幕分辨率的详尽信息；6）performance 对象，提供浏览器内存占用、导航行为和时间统计的详尽信息；7）对浏览器存储相关的操作比如 cookies、sessionStorage 、localStorage 等；8）其他自定义对象，如 XMLHttpRequest 和 IE 的 ActiveXObject；

##### 3.ECMAScript

ECMAScript 描述了 JavaScript 的语法和基本对象：1）语法；2）类型；3）语句；4）关键字；5） 保留字；6）操作符；7）全局对象；
ECMA 发布 262 号标准文件（ECMA-262）的第一版，规定了浏览器脚本语言的标准，并将这种语言称为 ECMAScript，这个版本就是 1.0 版，所以一句话描述就是，ECMAScript 是一套规范，JavaScript 则是 ECMAScript 一种实现。为什么说是一种实现呢，因为 Adobe ActionScript 同样也实现了 ECMAScript，JScript 也同样实现了 ECMAScript。

ES 版本相关

#### 关系

所以在简单了解了上面几个关键的概念之后我们就很容易得出他们之间的关系啦！在《JavaScript 高级程序设计第四版》中有这样一张图，将 JavaScript 、ECMAScript、 DOM 、BOM 四者的关系描述的非常清晰。
图片

我们得出结论：ECMAScript、 DOM 、BOM 是 JavaScript 的组成部分。

#### 总结

所以看到文章最后，当面试官问：”JavaScript 是什么 “ 的时候，我们就知道从哪开始说，从哪些方面开始讲。所以如果我们把这篇文章的要点都和面试官说清楚了的话，相信可以给面试官留下一个不至于太糟糕的印象 😋
JavaScript 的定位

JavaScript 是脚本编程语言
JavaScript 是弱类型语言
JavaScript 是动态类型的
JavaScript 是单线程的
JavaScript 解释型语言
JavaScript 具有良好的跨平台性
JavaScript 和 ECMAScript 的区别，以及和 DOM 、BOM 的关系

最后还是引用开头那段话，” 要真正学好用好 JavaScript，理解其本质、历史及局限性是非常重要的 “ ，一起共勉～

DOM（文档对象模型），提供了与网页内容交互的 方法 和 接口
BOM（浏览器对象模型），提供了与浏览器交互的 方法 和 接口
ECMAScript 描述了 JavaScript 的语法和基本对象
