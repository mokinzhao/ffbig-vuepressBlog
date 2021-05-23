---
title: Node多线程
---

### Node 实现多线程

#### Node.js 是如何工作的

Node.js 使用两种线程：event loop 处理的主线程和 worker pool 中的几个辅助线程。

事件循环是一种机制，它采用回调（函数）并注册它们，准备在将来的某个时刻执行。它与相关的 JavaScript 代码在同一个线程中运行。当 JavaScript 操作阻塞线程时，事件循环也会被阻止。

工作池是一种执行模型，它产生并处理单独的线程，然后同步执行任务，并将结果返回到事件循环。事件循环使用返回的结果执行提供的回调。

简而言之，它负责异步 I/O 操作 —— 主要是与系统磁盘和网络的交互。它主要由诸如 fs（I/O 密集）或 crypto（CPU 密集）等模块使用。工作池用 libuv 实现，当 Node 需要在 JavaScript 和 C++ 之间进行内部通信时，会导致轻微的延迟，但这几乎不可察觉。

基于这两种机制，我们可以编写如下代码：

fs.readFile(path.join(\_\_dirname, './package.json'), (err, content) => {
if (err) {
return null;
}

console.log(content.toString());
});
前面提到的 fs 模块告诉工作池使用其中一个线程来读取文件的内容，并在完成后通知事件循环。然后事件循环获取提供的回调函数，并用文件的内容执行它。

以上是非阻塞代码的示例，我们不必同步等待某事的发生。只需告诉工作池去读取文件，并用结果去调用提供的函数即可。由于工作池有自己的线程，因此事件循环可以在读取文件时继续正常执行。

在不需要同步执行某些复杂操作时，这一切都相安无事：任何运行时间太长的函数都会阻塞线程。如果应用程序中有大量这类功能，就可能会明显降低服务器的吞吐量，甚至完全冻结它。在这种情况下，无法继续将工作委派给工作池。

在需要对数据进行复杂的计算时（如 AI、机器学习或大数据）无法真正有效地使用 Node.js，因为操作阻塞了主（且唯一）线程，使服务器无响应。在 Node.js v10.5.0 发布之前就是这种情况，在这一版本增加了对多线程的支持。

#### 简介：worker_threads

worker_threads 模块允许我们创建功能齐全的多线程 Node.js 程序。

thread worker 是在单独的线程中生成的一段代码（通常从文件中取出）。

注意，术语 thread worker，worker 和 thread 经常互换使用，他们都指的是同一件事。

要想使用 thread worker，必须导入 worker_threads 模块。让我们先写一个函数来帮助我们生成这些 thread worker，然后再讨论它们的属性

```js
type WorkerCallback = (err: any, result?: any) => any;

export function runWorker(
  path: string,
  cb: WorkerCallback,
  workerData: object | null = null
) {
  const worker = new Worker(path, { workerData });

  worker.on("message", cb.bind(null, null));
  worker.on("error", cb);

  worker.on("exit", (exitCode) => {
    if (exitCode === 0) {
      return null;
    }

    return cb(new Error(`Worker has stopped with code ${exitCode}`));
  });

  return worker;
}
```

要创建一个 worker，首先必须创建一个 Worker 类的实例。它的第一个参数提供了包含 worker 的代码的文件的路径；第二个参数提供了一个名为 workerData 的包含一个属性的对象。这是我们希望线程在开始运行时可以访问的数据。

请注意：不管你是用的是 JavaScript， 还是最终要转换为 JavaScript 的语言（例如，TypeScript），路径应该始终引用带有 .js 或 .mjs 扩展名的文件。

我还想指出为什么使用回调方法，而不是返回在触发 message 事件时将解决的 promise。这是因为 worker 可以发送许多 message 事件，而不是一个。

正如你在上面的例子中所看到的，线程间的通信是基于事件的，这意味着我们设置了 worker 在发送给定事件后调用的侦听器。

以下是最常见的事件：

```js
worker.on("error", (error) => {});
```

只要 worker 中有未捕获的异常，就会发出 error 事件。然后终止 worker，错误可以作为提供的回调中的第一个参数。

```js
worker.on("exit", (exitCode) => {});
```

在 worker 退出时会发出 exit 事件。如果在 worker 中调用了 process.exit()，那么 exitCode 将被提供给回调。如果 worker 以 worker.terminate() 终止，则代码为 1。

```js
worker.on("online", () => {});
```

只要 worker 停止解析 JavaScript 代码并开始执行，就会发出 online 事件。它不常用，但在特定情况下可以提供信息。

```js
worker.on("message", (data) => {});
```

只要 worker 将数据发送到父线程，就会发出 message 事件。

现在让我们来看看如何在线程之间共享数据。

#### 在线程之间交换数据

要将数据发送到另一个线程，可以用 port.postMessage() 方法。它的原型如下：

```js
port.postMessage(data[, transferList])
```

port 对象可以是 parentPort，也可以是 MessagePort 的实例 —— 稍后会详细讲解。

#### 数据参数

第一个参数 —— 这里被称为 data —— 是一个被复制到另一个线程的对象。它可以是复制算法所支持的任何内容。

数据由结构化克隆算法进行复制。引用自 Mozilla：

它通过递归输入对象来进行克隆，同时保持之前访问过的引用的映射，以避免无限遍历循环。
该算法不复制函数、错误、属性描述符或原型链。还需要注意的是，以这种方式复制对象与使用 JSON 不同，因为它可以包含循环引用和类型化数组，而 JSON 不能。

由于能够复制类型化数组，该算法可以在线程之间共享内存。

#### 在线程之间共享内存

人们可能会说像 cluster 或 child_process 这样的模块在很久以前就开始使用线程了。这话对，也不对。

cluster 模块可以创建多个节点实例，其中一个主进程在它们之间对请求进行路由。集群能够有效地增加服务器的吞吐量；但是我们不能用 cluster 模块生成一个单独的线程。

人们倾向于用 PM2 这样的工具来集中管理他们的程序，而不是在自己的代码中手动执行，如果你有兴趣，可以研究一下如何使用 cluster 模块。

child_process 模块可以生成任何可执行文件，无论它是否是用 JavaScript 写的。它和 worker_threads 非常相似，但缺少后者的几个重要功能。

具体来说 thread workers 更轻量，并且与其父线程共享相同的进程 ID。它们还可以与父线程共享内存，这样可以避免对大的数据负载进行序列化，从而更有效地来回传递数据。

现在让我们看一下如何在线程之间共享内存。为了共享内存，必须将 ArrayBuffer 或 SharedArrayBuffer 的实例作为数据参数发送到另一个线程。

这是一个与其父线程共享内存的 worker：

```js
import { parentPort } from "worker_threads";

parentPort.on("message", () => {
  const numberOfElements = 100;
  const sharedBuffer = new SharedArrayBuffer(
    Int32Array.BYTES_PER_ELEMENT * numberOfElements
  );
  const arr = new Int32Array(sharedBuffer);

  for (let i = 0; i < numberOfElements; i += 1) {
    arr[i] = Math.round(Math.random() * 30);
  }

  parentPort.postMessage({ arr });
});
```

首先，我们创建一个 SharedArrayBuffer，其内存需要包含 100 个 32 位整数。接下来创建一个 Int32Array 实例，它将用缓冲区来保存其结构，然后用一些随机数填充数组并将其发送到父线程。

在父线程中：

```js
import path from "path";

import { runWorker } from "../run-worker";

const worker = runWorker(path.join(__dirname, "worker.js"), (err, { arr }) => {
  if (err) {
    return null;
  }

  arr[0] = 5;
});

worker.postMessage({});
```

把 arr [0] 的值改为 5，实际上会在两个线程中修改它。

当然，通过共享内存，我们冒险在一个线程中修改一个值，同时也在另一个线程中进行了修改。但是我们在这个过程中也得到了一个好处：该值不需要进行序列化就可以另一个线程中使用，这极大地提高了效率。只需记住管理数据正确的引用，以便在完成数据处理后对其进行垃圾回收。

共享一个整数数组固然很好，但我们真正感兴趣的是共享对象 —— 这是存储信息的默认方式。不幸的是，没有 SharedObjectBuffer 或类似的东西，但我们可以自己创建一个类似的结构。

#### transferList 参数

transferList 中只能包含 ArrayBuffer 和 MessagePort。一旦它们被传送到另一个线程，就不能再次被传送了；因为内存里的内容已经被移动到了另一个线程。

目前，还不能通过 transferList（可以使用 child_process 模块）来传输网络套接字。

#### 创建通信渠道

线程之间的通信是通过 port 进行的，port 是 MessagePort 类的实例，并启用基于事件的通信。

使用 port 在线程之间进行通信的方法有两种。第一个是默认值，这个方法比较容易。在 worker 的代码中，我们从 worker_threads 模块导入一个名为 parentPort 的对象，并使用对象的 .postMessage() 方法将消息发送到父线程。

这是一个例子：

```js
import { parentPort } from "worker_threads";
const data = {
  // ...
};

parentPort.postMessage(data);
```

parentPort 是 Node.js 在幕后创建的 MessagePort 实例，用于与父线程进行通信。这样就可以用 parentPort 和 worker 对象在线程之间进行通信。

线程间的第二种通信方式是创建一个 MessageChannel 并将其发送给 worker。以下代码是如何创建一个新的 MessagePort 并与我们的 worker 共享它：

```js
import path from "path";
import { Worker, MessageChannel } from "worker_threads";

const worker = new Worker(path.join(__dirname, "worker.js"));

const { port1, port2 } = new MessageChannel();

port1.on("message", (message) => {
  console.log("message from worker:", message);
});

worker.postMessage({ port: port2 }, [port2]);
```

在创建 port1 和 port2 之后，我们在 port1 上设置事件监听器并将 port2 发送给 worker。我们必须将它包含在 transferList 中，以便将其传输给 worker 。

在 worker 内部：

```js
import { parentPort, MessagePort } from "worker_threads";

parentPort.on("message", (data) => {
  const { port }: { port: MessagePort } = data;

  port.postMessage("heres your message!");
});
```

这样，我们就能使用父线程发送的 port 了。

使用 parentPort 不一定是错误的方法，但最好用 MessageChannel 的实例创建一个新的 MessagePort，然后与生成的 worker 共享它。

请注意，在后面的例子中，为了简便起见，我用了 parentPort。

#### 使用 worker 的两种方式

可以通过两种方式使用 worker。第一种是生成一个 worker，然后执行它的代码，并将结果发送到父线程。通过这种方法，每当出现新任务时，都必须重新创建一个工作者。

第二种方法是生成一个 worker 并为 message 事件设置监听器。每次触发 message 时，它都会完成工作并将结果发送回父线程，这会使 worker 保持活动状态以供以后使用。

Node.js 文档推荐第二种方法，因为在创建 thread worker 时需要创建虚拟机并解析和执行代码，这会产生比较大的开销。所以这种方法比不断产生新 worker 的效率更高。

这种方法被称为工作池，因为我们创建了一个工作池并让它们等待，在需要时调度 message 事件来完成工作。

以下是一个产生、执行然后关闭 worker 例子：

```js
import { parentPort } from "worker_threads";

const collection = [];

for (let i = 0; i < 10; i += 1) {
  collection[i] = i;
}

parentPort.postMessage(collection);
```

将 collection 发送到父线程后，它就会退出。

下面是一个 worker 的例子，它可以在给定任务之前等待很长一段时间：

```js
import { parentPort } from "worker_threads";

parentPort.on("message", (data: any) => {
  const result = doSomething(data);

  parentPort.postMessage(result);
});
```

#### worker_threads 模块中可用的重要属性

worker_threads 模块中有一些可用的属性：

- isMainThread
  当不在工作线程内操作时，该属性为 true 。如果你觉得有必要，可以在 worker 文件的开头包含一个简单的 if 语句，以确保它只作为 worker 运行。

```js
import { isMainThread } from "worker_threads";

if (isMainThread) {
  throw new Error("Its not a worker");
}
```

- workerData
  产生线程时包含在 worker 的构造函数中的数据。

```js
const worker = new Worker(path, { workerData });
```

在工作线程中：

```js
import { workerData } from "worker_threads";

console.log(workerData.property);
```

- parentPort

前面提到的 MessagePort 实例，用于与父线程通信。

- threadId
  分配给 worker 的唯一标识符。

现在我们知道了技术细节，接下来实现一些东西并在实践中检验学到的知识。

#### 实现 setTimeout

setTimeout 是一个无限循环，顾名思义，用来检测程序运行时间是否超时。它在循环中检查起始时间与给定毫秒数之和是否小于实际日期。

```js
import { parentPort, workerData } from "worker_threads";

const time = Date.now();

while (true) {
  if (time + workerData.time <= Date.now()) {
    parentPort.postMessage({});
    break;
  }
}
```

这个特定的实现产生一个线程，然后执行它的代码，最后在完成后退出。

接下来实现使用这个 worker 的代码。首先创建一个状态，用它来跟踪生成的 worker：

```js
const timeoutState: { [key: string]: Worker } = {};
```

然后时负责创建 worker 并将其保存到状态的函数：

```js
const id = uuidv4();

 const worker = runWorker(
   path.join(__dirname, './timeout-worker.js'),
   (err) => {
     if (!timeoutState[id]) {
       return null;
     }

     timeoutState[id] = null;

     if (err) {
       return callback(err);
     }

     callback(null);
   },
   {
     time,
   },
 );

 timeoutState[id] = worker;

 return id;
}
```

#### 参考

-[Node.js 多线程完全指南](https://segmentfault.com/a/1190000018660861)
