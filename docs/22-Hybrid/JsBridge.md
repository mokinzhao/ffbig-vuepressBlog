---
title: JsBridge原理
---

### 一、什么是 JSBridge

---

主要是给 JavaScript 提供调用 Native 功能的接口，让混合开发中的前端部分可以方便地使用 Native 的功能（例如：地址位置、摄像头）。

而且 JSBridge 的功能不止调用 Native 功能这么简单宽泛。实际上，JSBridge 就像其名称中的 Bridge 的意义一样，是 Native 和非 Native 之间的桥梁，它的核心是构建 Native 和非 Native 间消息通信的通道，而且这个通信的通道是双向的。

> 双向通信的通道:
>
> - JS 向 Native 发送消息: 调用相关功能、通知 Native 当前 JS 的相关状态等。
> - Native 向 JS 发送消息: 回溯调用结果、消息推送、通知 JS 当前 Native 的状态等。

H5 与 Native 交互如下图：
![在这里插入图片描述](https://img-blog.csdnimg.cn/2019062410483862.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3l1emhlbmdmZWk3,size_16,color_FFFFFF,t_70)

#### 二、JSBridge 的实现原理

---

JavaScript 是运行在一个单独的 JS Context 中（例如，WebView 的 Webkit 引擎、JSCore）。由于这些 Context 与原生运行环境的天然隔离，我们可以将这种情况与 RPC（Remote Procedure Call，远程过程调用）通信进行类比，将 Native 与 JavaScript 的每次互相调用看做一次 RPC 调用。

在 JSBridge 的设计中，可以把前端看做 RPC 的客户端，把 Native 端看做 RPC 的服务器端，从而 JSBridge 要实现的主要逻辑就出现了：通信调用（Native 与 JS 通信） 和句柄解析调用。

#### 三、JSBridge 的通信原理

---

##### 1.JavaScript 调用 Native 的方式

主要有两种：注入 API 和 拦截 URL SCHEME。

###### 1.1 注入 API

注入 API 方式的主要原理是，通过 WebView 提供的接口，向 JavaScript 的 Context（window）中注入对象或者方法，让 JavaScript 调用时，直接执行相应的 Native 代码逻辑，达到 JavaScript 调用 Native 的目的。

对于 iOS 的 UIWebView，实例如下：

```js
    JSContext *context = [uiWebView valueForKeyPath:@"documentView.webView.mainFrame.javaScriptContext"];

    context[@"postBridgeMessage"] = ^(NSArray<NSArray *> *calls) {
        // Native 逻辑
    };


    //前端调用方式：
    window.postBridgeMessage(message);

对于 iOS 的 WKWebView 可以用以下方式：

    @interface WKWebVIewVC ()<WKScriptMessageHandler>

    @implementation WKWebVIewVC

    - (void)viewDidLoad {
        [super viewDidLoad];

        WKWebViewConfiguration* configuration = [[WKWebViewConfiguration alloc] init];
        configuration.userContentController = [[WKUserContentController alloc] init];
        WKUserContentController *userCC = configuration.userContentController;
        // 注入对象，前端调用其方法时，Native 可以捕获到
        [userCC addScriptMessageHandler:self name:@"nativeBridge"];

        WKWebView wkWebView = [[WKWebView alloc] initWithFrame:self.view.frame configuration:configuration];

        // TODO 显示 WebView
    }

    - (void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)message {
        if ([message.name isEqualToString:@"nativeBridge"]) {
            NSLog(@"前端传递的数据 %@: ",message.body);
            // Native 逻辑
        }
    }
```

    // 前端调用方式：
    window.webkit.messageHandlers.nativeBridge.postMessage(message);

###### 1.2 拦截 URL SCHEME

解释一下 URL SCHEME：URL SCHEME 是一种类似于 url 的链接，是为了方便 app 直接互相调用设计的，形式和普通的 url 近似，主要区别是 protocol 和 host 一般是自定义的。

> 例如:
>
> qunarhy://hy/url?url=ymfe.tech，
>
> protocol 是 qunarhy，host 则是 hy。

拦截 URL SCHEME 的主要流程是：Web 端通过某种方式（例如 iframe.src）发送 URL Scheme 请求，之后 Native 拦截到请求并根据 URL SCHEME（包括所带的参数）进行相关操作。

在时间过程中，这种方式有一定的缺陷：

- 使用 iframe.src 发送 URL SCHEME 会有 url 长度的隐患。

> 有些方案为了规避 url 长度隐患的缺陷，在 iOS 上采用了使用 Ajax 发送同域请求的方式，并将参数放到 head 或 body 里。这样，虽然规避了 url 长度的隐患，但是 WKWebView 并不支持这样的方式。
>
> 为什么选择 iframe.src 不选择 locaiton.href ？
>
> 因为如果通过 location.href 连续调用 Native，很容易丢失一些调用。

- 创建请求，需要一定的耗时，比注入 API 的方式调用同样的功能，耗时会较长。

因此：JavaScript 调用 Native 推荐使用注入 API 的方式

##### 2.Native 调用 JavaScript 的方式

相比于 JavaScript 调用 Native， Native 调用 JavaScript 较为简单，直接执行拼接好的 JavaScript 代码即可。

从外部调用 JavaScript 中的方法，因此 JavaScript 的方法必须在全局的 window 上。

对于 iOS 的 UIWebView，示例如下：

```js
    result = [uiWebview stringByEvaluatingJavaScriptFromString:javaScriptString];

    * javaScriptString为JavaScript 代码串

对于 iOS 的 WKWebView，示例如下：

    [wkWebView evaluateJavaScript:javaScriptString completionHandler:completionHandler];
```

#### 四、JSBridge 接口实现

---

从上面的剖析中，可以得知，JSBridge 的接口主要功能有两个：调用 Native（给 Native 发消息） 和 接被 Native 调用（接收 Native 消息）。因此，JSBridge 可以设计如下：

```js
window.JSBridge = {
  // 调用 Native
  invoke: function(msg) {
    // 判断环境，获取不同的 nativeBridge
    nativeBridge.postMessage(msg);
  },
  receiveMessage: function(msg) {
    // 处理 msg
  }
};
```

在上面部分中，提到过 RPC 中有一个非常重要的环节是 **句柄解析调用** ，这点在 JSBridge 中体现为 **句柄与功能对应关系**。同时，我们将句柄抽象为 **桥名（BridgeName）**，最终演化为一个 BridgeName 对应一个 Native 功能或者一类 Native 消息。基于此点，JSBridge 的实现可以优化为如下：

```js
window.JSBridge = {
  // 调用 Native
  invoke: function(bridgeName, data) {
    // 判断环境，获取不同的 nativeBridge
    nativeBridge.postMessage({
      bridgeName: bridgeName,
      data: data || {}
    });
  },
  receiveMessage: function(msg) {
    var bridgeName = msg.bridgeName,
      data = msg.data || {};
    // 具体逻辑
  }
};
```

终极提问：消息都是单向的，那么调用 Native 功能时 Callback 怎么实现的？

对于 JSBridge 的 Callback ，其实就是 RPC 框架的回调机制。当然也可以用更简单的 JSONP 机制解释：

> 当发送 JSONP 请求时，url 参数里会有 callback 参数，其值是 当前页面唯一 的，而同时以此参数值为 key 将回调函数存到 window 上，随后，服务器返回 script 中，也会以此参数值作为句柄，调用相应的回调函数。

**整体流程**：

在 Native 端配合实现 JSBridge 的 JavaScript 调用 Native 逻辑也很简单，主要的代码逻辑是：接收到 JavaScript 消息 => 解析参数，拿到 bridgeName、data 和 callbackId => 根据 bridgeName 找到功能方法，以 data 为参数执行 => 执行返回值和 callbackId 一起回传前端。

\***\*Native 调用 JavaScript\*\*** 也同样简单，直接自动生成一个唯一的 ResponseId，并存储句柄，然后和 data 一起发送给前端即可。

#### 五、JSBridge 的引用

---

对于 JSBridge 的引用，常用有如下两种方式，但各有利弊。

##### 1.由 Native 端进行注入

注入方式和 Native 调用 JavaScript 类似，直接执行桥的全部代码。

它的优点是：

> 桥的版本很容易与 Native 保持一致，Native 端不用对不同版本的 JSBridge 进行兼容。

它的缺点是：

> 注入时机不确定，需要实现注入失败后重试的机制，保证注入的成功率，同时 JavaScript 端在调用接口时，需要优先判断 JSBridge 是否已经注入成功。

##### 2.由 JavaScript 端引用

直接与 JavaScript 一起执行。

它的优点是：

> JavaScript 端可以确定 JSBridge 的存在，直接调用即可。

它的缺点是：

> 如果桥的实现方式有更改，JSBridge 需要兼容多版本的 Native Bridge 或者 Native Bridge 兼容多版本的 JSBridge。
