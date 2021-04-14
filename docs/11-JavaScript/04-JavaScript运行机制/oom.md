---
title: JavaScript内存泄漏治理
---

内存泄漏的场景
那么到底有哪些情况会出现内存泄漏的情况呢？这里列举了常见的几种：

- 闭包使用不当引起内存泄漏
- 全局变量
- 分离的 DOM 节点
- 控制台的打印
- 遗忘的定时器
  接下来介绍一下各种情况，并尝试用刚才讲到的两种方法来捕捉问题所在

### 1.闭包使用不当

文章开头的例子中，在退出 fn1 函数执行上下文后，该上下文中的变量 a 本应被当作垃圾数据给回收掉，但因 fn1 函数最终将变量 a 返回并赋值给全局变量 res，其产生了对变量 a 的引用，所以变量 a 被标记为活动变量并一直占用着相应的内存，假设变量 res 后续用不到，这就算是一种闭包使用不当的例子

接下来尝试使用 Performance 和 Memory 来查看一下闭包导致的内存泄漏问题，为了使内存泄漏的结果更加明显，我们稍微改动一下文章开头的例子，代码如下：

```js
<button onclick="myClick()">执行fn1函数</button>
<script>
    function fn1 () {
        let a = new Array(10000)  // 这里设置了一个很大的数组对象

        let b = 3

        function fn2() {
            let c = [1, 2, 3]
        }

        fn2()

        return a
    }

    let res = []

    function myClick() {
        res.push(fn1())
    }
</script>

```

设置了一个按钮，每次执行就会将 fn1 函数的返回值添加到全局数组变量 res 中，是为了能在 performacne 的曲线图中看出效果，如图所示：

![2019-06-20-12-38-57](https://mmbiz.qpic.cn/sz_mmbiz_gif/gMvNo9rxo40Jm8n8icgTko5QVs956D4lssW2hzR8TFicvwJ9Iqpkiak9bRMicZ8yLBXicqB4gch1edMJO0A84cmn3FA/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

在每次录制开始时手动触发一次垃圾回收机制，这是为了确认一个初始的堆内存基准线，便于后面的对比，然后我们点击了几次按钮，即往全局数组变量 res 中添加了几个比较大的数组对象，最后再触发一次垃圾回收，发现录制结果的 JS Heap 曲线刚开始成阶梯式上升的，最后的曲线的高度比基准线要高，说明可能是存在内存泄漏的问题

在得知有内存泄漏的情况存在时，我们可以改用 Memory 来更明确得确认问题和定位问题

首先可以用 Allocation instrumentation on timeline 来确认问题，如下图所示：
![2019-06-20-12-38-57](https://mmbiz.qpic.cn/sz_mmbiz_gif/gMvNo9rxo40Jm8n8icgTko5QVs956D4lspicJqey0Ka7oia6RUyfRAibAl1I8P9VicFEqmcGic9sfgTEC293LzYY6iaew/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

在我们每次点击按钮后，动态内存分配情况图上都会出现一个蓝色的柱形，并且在我们触发垃圾回收后，蓝色柱形都没变成灰色柱形，即之前分配的内存并未被清除

所以此时我们就可以更明确得确认内存泄漏的问题是存在的了，接下来就精准定位问题，可以利用 Heap snapshot 来定位问题，如图所示：
![2019-06-20-12-38-57](https://mmbiz.qpic.cn/sz_mmbiz_gif/gMvNo9rxo40Jm8n8icgTko5QVs956D4ls3AkUfnzPic4jDjafdY1NGK0qdXK0icicAO0NM32C8FAibprg1x4KveAwAA/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)
第一次先点击快照记录初始的内存情况，然后我们多次点击按钮后再次点击快照，记录此时的内存情况，发现从原来的 1.1M 内存空间变成了 1.4M 内存空间，然后我们选中第二条快照记录，可以看到右上角有个 All objects 的字段，其表示展示的是当前选中的快照记录所有对象的分配情况，而我们想要知道的是第二条快照与第一条快照的区别在哪，所以选择 Object allocated between Snapshot1 and Snapshot2，即展示第一条快照和第二条快照存在差异的内存对象分配情况，此时可以看到 Array 的百分比很高，初步可以判断是该变量存在问题，点击查看详情后就能查看到该变量对应的具体数据了

以上就是一个判断闭包带来内存泄漏问题并简单定位的方法了

### 2.全局变量

全局的变量一般是不会被垃圾回收掉的，在文章开头也提到过了。当然这并不是说变量都不能存在全局，只是有时候会因为疏忽而导致某些变量流失到全局，例如未声明变量，却直接对某变量进行赋值，就会导致该变量在全局创建，如下所示：

```js
function fn1() {
  // 此处变量name未被声明
  name = new Array(99999999);
}

fn1();
```

此时这种情况就会在全局自动创建一个变量 name，并将一个很大的数组赋值给 name，又因为是全局变量，所以该内存空间就一直不会被释放

解决办法的话，自己平时要多加注意，不要在变量未声明前赋值，或者也可以开启严格模式，这样就会在不知情犯错时，收到报错警告，例如：

```js
function fn1() {
  "use strict";
  name = new Array(99999999);
}

fn1();
```

### 3.分离的 DOM 节点

什么叫 DOM 节点？假设你手动移除了某个 dom 节点，本应释放该 dom 节点所占用的内存，但却因为疏忽导致某处代码仍对该被移除节点有引用，最终导致该节点所占内存无法被释放，例如这种情况：

```js
<div id="root">
    <div class="child">我是子元素</div>
    <button>移除</button>
</div>
<script>

    let btn = document.querySelector('button')
    let child = document.querySelector('.child')
    let root = document.querySelector('#root')

    btn.addEventListener('click', function() {
        root.removeChild(child)
    })

</script>
```

该代码所做的操作就是点击按钮后移除.child 的节点，虽然点击后，该节点确实从 dom 被移除了，但全局变量 child 仍对该节点有引用，所以导致该节点的内存一直无法被释放，可以尝试用 Memory 的快照功能来检测一下，如图所示：
![2019-06-20-12-38-57](https://mmbiz.qpic.cn/sz_mmbiz_gif/gMvNo9rxo40Jm8n8icgTko5QVs956D4lsgbLQbkLUY3k5Zo7kZtRtmBuqwuU1uRbdvt2cuyoImrHkHT3Pjias8icg/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)
同样的先记录一下初始状态的快照，然后点击移除按钮后，再点击一次快照，此时内存大小我们看不出什么变化，因为移除的节点占用的内存实在太小了可以忽略不计，但我们可以点击第二条快照记录，在筛选框里输入 detached，于是就会展示所有脱离了却又未被清除的节点对象

解决办法如下图所示：

```js
<div id="root">
    <div class="child">我是子元素</div>
    <button>移除</button>
</div>
<script>
    let btn = document.querySelector('button')

    btn.addEventListener('click', function() {
        let child = document.querySelector('.child')
        let root = document.querySelector('#root')

        root.removeChild(child)
    })

</script>
```

改动很简单，就是将对.child 节点的引用移动到了 click 事件的回调函数中，那么当移除节点并退出回调函数的执行上文后就会自动清除对该节点的引用，那么自然就不会存在内存泄漏的情况了，我们来验证一下，如下图所示：
![2019-06-20-12-38-57](https://mmbiz.qpic.cn/sz_mmbiz_gif/gMvNo9rxo40Jm8n8icgTko5QVs956D4lsVzXKvoGC4zic6ey9Rr5rgBY51j4oOtMBX9lu2lKGuPg8yNibUmhKyeKQ/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)
结果很明显，这样处理过后就不存在内存泄漏的情况了

### 4.控制台的打印

控制台的打印也会造成内存泄漏吗？？？？是的呀，如果浏览器不一直保存着我们打印对象的信息，我们为何能在每次打开控制的 Console 时看到具体的数据呢？先来看一段测试代码：

```js
<button>按钮</button>
<script>
    document.querySelector('button').addEventListener('click', function() {
        let obj = new Array(1000000)

        console.log(obj);
    })
</script>

```

### 5.遗忘的定时器

其实定时器也是平时很多人会忽略的一个问题，比如定义了定时器后就再也不去考虑清除定时器了，这样其实也会造成一定的内存泄漏。来看一个代码示例：

```js
<button>开启定时器</button>
<script>

    function fn1() {
        let largeObj = new Array(100000)

        setInterval(() => {
            let myObj = largeObj
        }, 1000)
    }

    document.querySelector('button').addEventListener('click', function() {
        fn1()
    })
</script>
```

简单总结一下： 大家在平时用到了定时器，如果在用不到定时器后一定要清除掉，否则就会出现本例中的情况。除了 setTimeout 和 setInterval，其实浏览器还提供了一个 API 也可能就存在这样的问题，那就是 requestAnimationFrame

### 6 总结

在项目过程中，如果遇到了某些性能问题可能跟内存泄漏有关时，就可以参照本文列举的 5 种情况去排查，一定能找到问题所在并给到解决办法的。

虽然 JavaScript 的垃圾回收是自动的，但我们有时也是需要考虑要不要手动清除某些变量的内存占用的，例如你明确某个变量在一定条件下再也不需要，但是还会被外部变量引用导致内存无法得到释放时，你可以用 null 对该变量重新赋值就可以在后续垃圾回收阶段释放该变量的内存了。
