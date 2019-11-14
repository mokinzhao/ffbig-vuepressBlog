---
title: Egg.js-源码分析（项目启动）
---

## 前言

前端时间抽出时间针对[Koa2](https://github.com/koajs/koa)源码进行了简单的学习，**koa** 源码是一个很简单的库， 针对分析过程， 想手把手的实现一个类型**koa** 的框架，其[代码](https://github.com/bluebrid/koa-learning), 根据一步步的完善实现一个简单版本的 Koa, 每一个步骤一个**Branch** ， 如： [stpe-1](https://github.com/bluebrid/koa-learning/tree/step-1), 对应的是我想实现第一步的代码， 代码仅供自己简单的学习，很多地方不完善，只是想体验下 Koa 的思想。下面几点是我对 Koa 的简单理解:

> - 所有的 NodeJS 框架最基本的核心就是通过原生库`http` or `https`启动一个后端服务`http.createServer(this.serverCallBack()).listen(...arg)`， 然后所有的请求都会进入`serverCallBack`方法， 然后我们可以通过拦截，在这个方法中处理不同的请求
> - Koa 是一个洋葱模型， 其是基于中间件来实现的.通过`use`来添加一个中间件， `koa-router`其实就是一个`koa`的中间件，我们的所有的请求都会将所有的中间件都执行一遍，洋葱模型如下图所示

```
<figure>![](https://user-gold-cdn.xitu.io/2018/11/12/16706e6c0db63bd6?imageView2/0/w/1280/h/960/ignore-error/1)<figcaption></figcaption></figure>
<figure>![](https://user-gold-cdn.xitu.io/2018/11/12/16706e706333f9eb?imageView2/0/w/1280/h/960/ignore-error/1)<figcaption></figcaption></figure>
```

上面是我对 Koa 源码分析的一些简单的理解， 后面我会将对 Koa 的理解，进一步的记录下来。 Koa 是一个很小巧灵活的框架， 不像 Express, Express 已经集成了很多的功能， 很多功能不再需要第三方的框架，比如说路由功能， Koa 需要引用第三方的库 koa-router 来实现路由等。但是 express 则不需要，下面是 Koa 和 Express, 两个实现一个简单的功能的 Demo , 我们可以比较下其使用方式：

```
    // Express
    const express = require(<span class="hljs-string">'express'</span>)
    const app = express()

    app.get(<span class="hljs-string">'/'</span>, <span class="hljs-keyword">function</span> (req, res) {
      res.send(<span class="hljs-string">'Hello World!'</span>)
    })

    app.listen(3000, <span class="hljs-function"><span class="hljs-title">function</span></span> () {
      console.log(<span class="hljs-string">'Example app listening on port 3000!'</span>)
    })
    <span class="copy-code-btn">复制代码</span>`</pre><pre>`// Koa
    var Koa = require(<span class="hljs-string">'koa'</span>);
    // 引用第三方路由库
    var Router = require(<span class="hljs-string">'koa-router'</span>);

    var app = new Koa();
    var router = new Router();
    router.get(<span class="hljs-string">'/'</span>, (ctx, next) =&gt; {
      // ctx.router available
    });
    // 应用中间件： router
    app
      .use(router.routes())
      .use(router.allowedMethods());
    app.listen(3000);
    <span class="copy-code-btn">复制代码</span>`</pre>
```

    哈哈，我们上面说了很多的废话(文字表达能力问题)， 其实我是想分析下，怎么基于Koa 框架去应用， [eggjs](https://github.com/eggjs/egg)就是基于Koa 框架基础上实现的一个框架， 我们下面来具体分析下**eggjs** 框架。

    ## Eggjs 基本使用

    我们根据[快速入门](https://eggjs.org/zh-cn/intro/quickstart.html), 可以很快搭建一个Egg 项目框架，

```
    <pre>`$ npm i egg-init -g
    $ egg-init egg-example --type=simple
    $ <span class="hljs-built_in">cd</span> egg-example
    $ npm i
    <span class="copy-code-btn">复制代码</span>`</pre>
```

    我们可以用`npm run dev` 快速启动项目.然后打开`localhost:7001`,就可以看到页面输出：

    hi, egg.

    说明我们项目初始化已经完成，而且已经启动成功。我们现在可以学习下egg项目生成的相关代码。其代码文件结构如下:

    <figure>![](https://user-gold-cdn.xitu.io/2018/11/12/167071dfb2cd29f5?imageView2/0/w/1280/h/960/ignore-error/1)<figcaption></figcaption></figure>

    分析整个文件结构，找了整个项目都没有发现app.js之类的入口文件(我一般学习一个新的框架，都会从入口文件着手), 发现**app** 文件夹下面的应该对项目很重要的代码：

    > 1, controller文件夹，我们从字面理解，应该是控制层的文件，其中有一个home.js 代码如下:
    ```
    <pre>`<span class="hljs-string">'use strict'</span>;

    const Controller = require(<span class="hljs-string">'egg'</span>).Controller;

    class HomeController extends Controller {
      async <span class="hljs-function"><span class="hljs-title">index</span></span>() {
        this.ctx.body = <span class="hljs-string">'hi, egg'</span>;
      }
    }

    module.exports = HomeController;

    <span class="copy-code-btn">复制代码</span>`</pre>

````
    这个类继承了egg 的Controller 类, 暂时还没有发现这个项目哪个地方有引用这个**Controller** 类?

    > 2, 一个**router.js** 文件， 从字面意义上我们可以理解其为一个路由的文件，其代码如下:
    ```
    <pre>`<span class="hljs-string">'use strict'</span>;

    /**
     * @param {Egg.Application} app - egg application
     */
    module.exports = app =&gt; {
      const { router, controller } = app;
      router.get(<span class="hljs-string">'/'</span>, controller.home.index);
    };

    <span class="copy-code-btn">复制代码</span>`</pre>
````

    这个文件暴露了一个方法， 从目前来猜测应该就是路由的一些配置， 但是找遍整个项目也没有发现，哪个地方引用了这个方法，
    `router.get('/', controller.home.index);`, 但是从这个get 方法的第二个参数， 其似乎指向的是Controller 里面的home.js 文件index 方法，我们可以尝试修改下home.js 中的`this.ctx.body = 'hi, egg -&gt; hello world!';`, 然后重新运行`npm run dev`, 发现页面输出是`hi, egg -&gt; hello world!`, 看来`controller.home.index`这个指向的是home.js 里的index 方法无疑了， 但是`controller.home.index`这个index 方法绑定的是在一个`controller`对象上，什么时候绑定的呢?

    我们接下来带着如下疑问来学些**eggjs** :

```
    > *   <font color="red">没有类似的app.js 入口文件，运行`npm run dev` 如何启动一个项目(启动server, 监听端口， 添加中间件)?</font>
    > *   <font color="red">我们打开页面`http://localhost:7001/`,怎么去通过router.js 去查找路由的，然后调用对应的回调函数?</font>
    > *   <font color="red">Controller 是如何绑定到app 上面的controller 对象上的?</font>
```

    ## eggjs 启动

    我们先查看一开始用`egg-init`命令创建的项目的package.json 文件,查看`scripts`，里面有一系列的命令，如下图:

````
    <figure>![](https://user-gold-cdn.xitu.io/2018/11/15/167165ee63bce475?imageView2/0/w/1280/h/960/ignore-error/1)<figcaption></figcaption></figure>
    ```
    我们可以通过`npm run start`来启动程序， 但是其中有一个命令`debug`, 我们可以可以通过`npm run debug`命令来调试eggjs 程序， 其对用的命令是`egg-bin debug`, 所以我们整个入口就是这个命令，我们下面来具体分析下`egg-bin debug`是如何工作的.

    ## egg-bin
````

    egg-bin 中的`start-cluster`文件， 调用了eggjs 的入口方法：`require(options.framework).startCluster(options);`
    其中options.framework指向的就是一个绝对路径`D:\private\your_project_name\node_modules\egg`(也就是**egg** 模块), 直接执行`D:\private\your_project_name\node_modules\egg\index.js`暴露出来的`exports.startCluster = require('egg-cluster').startCluster;` 的`startCluster`方法。 下面我们就来分析**egg-cluster** 模块。

```
    ## egg-cluster
```

    egg-cluster 的项目结构如下， 其中有两个主要的文件： `master.js`, `app_worker.js`两个文件，

    <figure>![](https://user-gold-cdn.xitu.io/2018/11/16/1671aa8306a9216a?imageView2/0/w/1280/h/960/ignore-error/1)<figcaption></figcaption></figure>

    `master.js`是跟nodejs的多线程有关，我们先跳过这一块，直接研究`app_worker.js`文件，学习eggjs 的启动过程。下面我们就是app_worker.js 执行的主要步骤。

```

```

1.  `const Application = require(options.framework).Application;` , 引入 eggjs 模块， optons.framework 指向的就是`D:\private\your_project_name\node_modules\egg`
2.  `const app = new Application(options);`(创建一个 egg 实例)
3.  `app.ready(startServer);`调用 egg 对象的** ready ** 方法，其 startServer 是一个回调函数，其功能是调用 nodejs 原生模块`http` or `https` 的 `createServer` 创建一个 nodejs 服务(`server = require('http').createServer(app.callback());`, 我们后续会深入分析这个方法)。

    上面三个步骤， 已经启动了一个 nodejs 服务， 监听了端口。也就是已经解决了我们的第一个疑问:

    > <font color="red"> 没有类似的 app.js 入口文件，运行 npm run dev 如何启动一个项目(启动 server, 监听端口， 添加中间件)?</font>

    上面其实我们还是只是分析了 eggjs 启动的基本流程， 还没有涉及 eggjs 的核心功能库，也就是** egg ** 和** egg-core** 两个库，但是我们上面已经初实例化了一个 eggjs 的对象`const app = new Application(options);`, 下面我们就从这个入口文件来分析 eggjs 的核心模块。

```
    ## egg &amp; egg-core
```

    egg 和 egg-core 模块下面有几个核心的类，如下:

    Application(egg/lib/applicaton.js) <font color="red" size="5">-----&gt;</font> EggApplication(egg/lib/egg.js) <font color="red" size="5">-----&gt;</font> EggCore(egg-core/lib/egg.js) <font color="red" size="5">-----&gt;</font> <font size="5"> KoaApplication(<font color="red">koa</font>)</font>

    从上面的关系可以，eggjs 是基于**koa**的基础上进行扩展的，所以我们从基类的构造函数开始进行分析(因为 new Application 会从继类开始的构造函数开始执行)。

    ### EggCore(egg-core/lib/egg.js)

    我们将构造函数进行精简，代码如下

    <figure>![](https://user-gold-cdn.xitu.io/2018/11/16/1671b43d9083e9d2?imageView2/0/w/1280/h/960/ignore-error/1)<figcaption></figcaption></figure>
    从上图可知，构造函数就是初始化了很多基础的属性，其中有两个属性很重要：
    > 1.  `this.lifecycle`负责整个eggjs 实例的生命周期，我们后续会深入分析整个生命周期
    > 1.  `this.loader`(egg-core/lib/loader/egg_loader.js)解决了eggjs 为什么在服务启动后，会自动加载，将项目路径下的`router.js`, `controller/**.js`, 以及`service/**.js`绑定到 `app` 实例上， 我们接下来会重点分析这个loader.

    ### EggApplication(egg/lib/egg.js)

    我们将构造函数进行精简，代码如下

    <figure>![](https://user-gold-cdn.xitu.io/2018/11/16/1671b4fde0678d85?imageView2/0/w/1280/h/960/ignore-error/1)<figcaption></figcaption></figure>

    这个构造函数同样也是初始化了很多基础的属性， 但是其中有调用**EggCore** 构造函数初始化的**loader** 的`loadConfig()` 方法, 这个方法顾名思义就是去加载配置，其指向的是: `egg/lib/loader/app_worker_loader .js` 的方法`loadConfig` , 这个方法，如下:

    <pre>`  <span class="hljs-function"><span class="hljs-title">loadConfig</span></span>() {
        this.loadPlugin();
        super.loadConfig();
      }

    <span class="copy-code-btn">复制代码</span>`</pre>

    其会加载所有的 Plugin ,然后就加载所有的 Config.

    this.loadPlugin() 指向的是`egg-core/lib/loader/mixin/plgin.js`的方法`loadPlugin`, 其会加载三种 plugin:

- `const appPlugins = this.readPluginConfigs(path.join(this.options.baseDir, 'config/plugin.default'));`,应用配置的 plugin , 也就是`your-project-name/config/plugin.js`, 也就是每个应用需要配置的特殊的插件
- `const eggPluginConfigPaths = this.eggPaths.map(eggPath =&gt; path.join(eggPath, 'config/plugin.default'));`, 也就是从 eggjs 框架配置的插件， 其路径是在`egg/config/plugin.js`, 也就是框架自带的插件
- `process.env.EGG_PLUGINS` 第三种， 是启动项目是，命令行带参数`EGG_PLUGINS`的插件， 应该使用不广。

```
  最后将所有的 plugin 挂在在 app 实例上`this.plugins = enablePlugins;`,。(后续会学习怎么这些 plugin 怎么工作的。)

  接下来会执行`super.loadConfig()`方法， 其指向的是`egg-core/lib/loader/mixin/config.js`的`loadConfig()`方法，
  其同样会加载四种 config:

- `const appConfig = this._preloadAppConfig();`, 应用配置的 config , 也就是每个应用的特殊配置，其会加载两个配置:

  <pre>`  const names = [
       <span class="hljs-string">'config.default'</span>,
       `config.<span class="hljs-variable">${this.serverEnv}</span>`,
     ];
  <span class="copy-code-btn">复制代码</span>`</pre>

  第一个一定会加载对应的`config.default`配置， 也就是`your-project-name/config/config.default.js`,跟运行环境没有关系的配置， 其次会加载跟运行环境有关的配置，如： `config.prod.js`, `config.test.js`, `config.local.js`, `config.unittest.js`

- 会去加载所有的 plugin 插件目录
```

  <pre>`   <span class="hljs-keyword">if</span> (this.orderPlugins) {
       <span class="hljs-keyword">for</span> (const plugin of this.orderPlugins) {
         dirs.push({
           path: plugin.path,
           <span class="hljs-built_in">type</span>: <span class="hljs-string">'plugin'</span>,
         });
       }
     }
  <span class="copy-code-btn">复制代码</span>`</pre>

```
- 会去加载 egg 项目目录, 也就是 egg/config 目录

  <pre>`    <span class="hljs-keyword">for</span> (const eggPath of this.eggPaths) {
       dirs.push({
         path: eggPath,
         <span class="hljs-built_in">type</span>: <span class="hljs-string">'framework'</span>,
       });
     }
  <span class="copy-code-btn">复制代码</span>`</pre>

- 回去加载应用项目的目录， 也就是也就是`your-project-name/config`

  最后将合并的 config 挂载在 app 实例上`this.config = target;`

  我们可以打开`egg/config/config.default.js`文件，可以查看下，默认的都有什么配置，其中一个配置如下：
```

  <pre>`  config.cluster = {
      listen: {
        path: <span class="hljs-string">''</span>,
        port: 7001,
        hostname: <span class="hljs-string">''</span>,
      },
    };
  <span class="copy-code-btn">复制代码</span>`</pre>

```
  很明显，这应该是一个对 server 启动的配置，我们暂且可以这样猜测。

  我们上面有分析在`egg-cluster/lib/app_worker.js`中，我们初始化**app** 后，我们有调用`app.ready(startServer);`方法，我们可以猜测`startServer`方法就是启动 nodejs server 的地方。

  在`startServer`方法中，初始化了一个 http server `server = require('http').createServer(app.callback());`, 然后我们给 listen `server.listen(...args);;`, 这样算是 node js 的 server 启动起来了， 我们可以查看下，我可以查看 args 的参数：

  <pre>`  const args = [ port ];
        <span class="hljs-keyword">if</span> (listenConfig.hostname) args.push(listenConfig.hostname);
        debug(<span class="hljs-string">'listen options %s'</span>, args);
        server.listen(...args);
  <span class="copy-code-btn">复制代码</span>`</pre>

  这里给 args 添加了 prot 端口参数， 我们可以跳转到 prot 定义的地方：
```

  <pre>`const app = new Application(options);
  const clusterConfig = app.config.cluster || /* istanbul ignore next */ {};
  const listenConfig = clusterConfig.listen || /* istanbul ignore next */ {};
  const port = options.port = options.port || listenConfig.port;
  <span class="copy-code-btn">复制代码</span>`</pre>

我们可以看到 port 最终来源于： `app.config.cluster.listen.port`,从这里我们得知， eggjs 的 config 的使用方式。

```
  **<font color="red"> 问题:</font>**

  如果我们不想在 eggjs 项目启动时，默认打开的端口不是**7001** ，我们改怎么操作呢？

  我们应该有如下两种方式：

1.  在执行 npm run debug 命令时，添加相应的参数
2.  我们可以在我们项目的 config/config.default.js 中添加配置，将默认的给覆盖掉，如：
```

    <pre>`
    module.exports = appInfo =&gt; {
      const config = exports = {};

      // use <span class="hljs-keyword">for</span> cookie sign key, should change to your own and keep security
      config.keys = appInfo.name + <span class="hljs-string">'_1541735701381_1116'</span>;

      // add your config here
      config.middleware = [];
      config.cluster = {
        listen: {
          path: <span class="hljs-string">''</span>,
          port: 7788,
          hostname: <span class="hljs-string">''</span>,
        },
      };
      <span class="hljs-built_in">return</span> config;
    };

    <span class="copy-code-btn">复制代码</span>`</pre>

    如上，我们再次启动项目的时候，打开的端口就是： 7788 了。

    **<font color="red"> 思考:</font>**

    我们已经知道可以在 config 中进行相应的配置了， 我们还有什么其他的应用在 config 上面呢？

    我们知道在不同的运行环境下，会加载不同的配置，那如果我们在开发的时候，调用 api 的路径是： `http://dev.api.com`, 但是在上线的时候，我们调用的 app 的路径是： `http://prod.api.com`, 我们就可以在
    `config.prod.js`中配置 `apiURL:http://prod.api.com`， 在`config.local.js`配置： `apiURL:http://prod.api.com`

    然后我们在我们调用 API 的地方通过 `app.apiURL`就可以。

    ### Application(egg/lib/application.js)

    Application(egg/lib/applicaton.js) <font color="red" size="5">-----&gt;</font> EggApplication(egg/lib/egg.js) <font color="red" size="5">-----&gt;</font> EggCore(egg-core/lib/egg.js) <font color="red" size="5">-----&gt;</font> <font size="5"> KoaApplication(<font color="red">koa</font>)</font>

    我们已经将上述的两个核心的类： EggApplication(egg/lib/egg.js) <font color="red" size="5">-----&gt;</font> EggCore(egg-core/lib/egg.js)， 我们现在来分析最上层的类： Application(egg/lib/applicaton.js)。

    我们还是从构造函数入手，我们发现了一行很重要的代码`this.loader.load();`其指向的是： **app_worker_loader.js**(egg/lib/loader/app_worker_loader.js)的 load 方法， 其实现如下：

    <pre>`  <span class="hljs-function"><span class="hljs-title">load</span></span>() {
        // app &gt; plugin &gt; core
        this.loadApplicationExtend();
        this.loadRequestExtend();
        this.loadResponseExtend();
        this.loadContextExtend();
        this.loadHelperExtend();
        // app &gt; plugin
        this.loadCustomApp();
        // app &gt; plugin
        this.loadService();
        // app &gt; plugin &gt; core
        this.loadMiddleware();
        // app
        this.loadController();
        // app
        this.loadRouter(); // Dependent on controllers
      }
    <span class="copy-code-btn">复制代码</span>`</pre>

    从这个方法可知，加载了一大批的配置，我们可以进行一一的分析：

```
    #### `this.loadApplicationExtend();`

    这个方法会去给应用加载很多的扩展方法， 其加载的路径是： app\extend\application.js, 会将对应的对象挂载在 app 应用上。 (使用方法可以参考 egg-jsonp/app/extend/applicaton.js 或者 egg-session/app/extend/application.js)

    #### `this.loadResponseExtend();` `this.loadResponseExtend();` `this.loadContextExtend();` `this.loadHelperExtend();`,

    跟`this.loadApplicationExtend();`加载的方式是一样的，只是对应的名称分别是： request.js， response.js， helper.js， context.js

    #### `this.loadCustomApp();`

    定制化应用， 加载的文件是对应项目下的 app.js (your_project_name/app.js)， 其具体的代码实现如下: (egg-core/lib/loader/mixin/custom.js)

```

    <pre>`  [LOAD_BOOT_HOOK](fileName) {
        this.timing.start(`Load <span class="hljs-variable">${fileName}</span>.js`);
        <span class="hljs-keyword">for</span> (const unit of this.getLoadUnits()) {
          const bootFilePath = this.resolveModule(path.join(unit.path, fileName));
          <span class="hljs-keyword">if</span> (!bootFilePath) {
            <span class="hljs-built_in">continue</span>;
          }
          const bootHook = this.requireFile(bootFilePath);
          // bootHook 是加载的文件
          <span class="hljs-keyword">if</span> (is.class(bootHook)) {
            // <span class="hljs-keyword">if</span> is boot class, add to lifecycle
            this.lifecycle.addBootHook(bootHook);
          } <span class="hljs-keyword">else</span> <span class="hljs-keyword">if</span> (is.function(bootHook)) {
            // <span class="hljs-keyword">if</span> is boot <span class="hljs-keyword">function</span>, wrap to class
            // <span class="hljs-keyword">for</span> compatibility
            this.lifecycle.addFunctionAsBootHook(bootHook);
          } <span class="hljs-keyword">else</span> {
            this.options.logger.warn(<span class="hljs-string">'[egg-loader] %s must exports a boot class'</span>, bootFilePath);
          }
        }
        // init boots
        this.lifecycle.init();
        this.timing.end(`Load <span class="hljs-variable">${fileName}</span>.js`);
      },
    <span class="copy-code-btn">复制代码</span>`</pre>

```

    从上可知** bootHook** 对应的就是加载的文件，从上面的`if` `else`可知， app.js 必须暴露出来的是一个**class** 或者是一个**function** ,然后调用`this.lifecycle.addFunctionAsBootHook(bootHook);`, 其代码如下：

```

    <pre>`  addFunctionAsBootHook(hook) {
        assert(this[INIT] === <span class="hljs-literal">false</span>, <span class="hljs-string">'do not add hook when lifecycle has been initialized'</span>);
        // app.js is <span class="hljs-built_in">export</span> as a funciton
        // call this <span class="hljs-keyword">function</span> <span class="hljs-keyword">in</span> configDidLoad
        this[BOOT_HOOKS].push(class Hook {
          constructor(app) {
            this.app = app;
          }
          <span class="hljs-function"><span class="hljs-title">configDidLoad</span></span>() {
            hook(this.app);
          }
        });
      }
    <span class="copy-code-btn">复制代码</span>`</pre>

```

    将对应的 hook push 到 this.lifecycle 的**BOOT_HOOKS** 数组中， 并且包装成了一个类， 且在**configDidLoad** 调用对应的 hook.然后调用了`this.lifecycle.init();`去初始化生命周期:

```

    <pre>`  <span class="hljs-function"><span class="hljs-title">init</span></span>() {
        assert(this[INIT] === <span class="hljs-literal">false</span>, <span class="hljs-string">'lifecycle have been init'</span>);
        this[INIT] = <span class="hljs-literal">true</span>;
        this[BOOTS] = this[BOOT_HOOKS].map(t =&gt; new t(this.app));
        this[REGISTER_BEFORE_CLOSE]();
      }
    <span class="copy-code-btn">复制代码</span>`</pre>

```
    这个**init** 方法做了三件事情：

- 将 lifecycle 的 INIT 状态标记为： true
- 将 BOOT_HOOKS 对应的类， 实例化一个对象，保存在**BOOTS** 上
- 调用 REGISTER_BEFORE_CLOSE 方法，其中会调用我们的 hook 的**beforeClose** 方法。

```

`this.loadCustomApp();` 方法如下：

  <pre>`  <span class="hljs-function"><span class="hljs-title">loadCustomApp</span></span>() {
      this[LOAD_BOOT_HOOK](<span class="hljs-string">'app'</span>);
      this.lifecycle.triggerConfigWillLoad();
    },
  <span class="copy-code-btn">复制代码</span>`</pre>

所以接下执行`this.lifecycle.triggerConfigWillLoad();`

  <pre>`  <span class="hljs-function"><span class="hljs-title">triggerConfigWillLoad</span></span>() {
      <span class="hljs-keyword">for</span> (const boot of this[BOOTS]) {
        <span class="hljs-keyword">if</span> (boot.configWillLoad) {
          boot.configWillLoad();
        }
      }
      this.triggerConfigDidLoad();
    }

    <span class="hljs-function"><span class="hljs-title">triggerConfigDidLoad</span></span>() {
      <span class="hljs-keyword">for</span> (const boot of this[BOOTS]) {
        <span class="hljs-keyword">if</span> (boot.configDidLoad) {
          boot.configDidLoad();
        }
      }
      this.triggerDidLoad();
    }
  <span class="copy-code-btn">复制代码</span>`</pre>

其中`boot.configDidLoad();` 就是我们 app.js 定义的 hook, 被加工成的 Hook 类：

  <pre>`class Hook {
        constructor(app) {
          this.app = app;
        }
        <span class="hljs-function"><span class="hljs-title">configDidLoad</span></span>() {
          hook(this.app);
        }
      }
  <span class="copy-code-btn">复制代码</span>`</pre>

然后就将 app.js 与 eggjs 关联起来了。

#### `this.loadService();`

查找的 your_project_name/app/service/**.js, 然后将文件名称作为一个作为属性，挂载在**context\*\*上下文上，然后将对应的 js 文件，暴露的方法赋值在这个属性上， 比如说我们在如下路径下： `your_project_name/app/service/home.js`, 其代码如下：

  <pre>`<span class="hljs-string">'use strict'</span>;

  // app/service/home.js
  const Service = require(<span class="hljs-string">'egg'</span>).Service;

  class HomeService extends Service {
    async <span class="hljs-function"><span class="hljs-title">find</span></span>() {
      // const user = await this.ctx.db.query(<span class="hljs-string">'select * from user where uid = ?'</span>, uid);
      const user = [
        {
          name: <span class="hljs-string">'Ivan Fan'</span>,
          age: 18,
        },
      ];
      <span class="hljs-built_in">return</span> user;
    }
  }

  module.exports = HomeService;
  <span class="copy-code-btn">复制代码</span>`</pre>

我们在其他的地方就可以通过： `this.ctx.service.home.find()`方法调用 service 里面的方法了，如在 controller 中调用：

  <pre>`<span class="hljs-string">'use strict'</span>;
  const Controller = require(<span class="hljs-string">'egg'</span>).Controller;
  class HomeController extends Controller {
    async <span class="hljs-function"><span class="hljs-title">index</span></span>() {
      // this.ctx.body = <span class="hljs-string">'hi, egg'</span>;
      this.ctx.body = await this.ctx.service.home.find();
    }
  }
  module.exports = HomeController;
  <span class="copy-code-btn">复制代码</span>`</pre>

#### `this.loadMiddleware();`

<font size="5">这个方法用来加载中间件，我们后面会单独来分析中间件</font>

```
  #### `this.loadController();`

  这个方法是去加载 controller , 其代码如下：

```

  <pre>`  loadController(opt) {
      this.timing.start(<span class="hljs-string">'Load Controller'</span>);
      opt = Object.assign({
        <span class="hljs-keyword">case</span>Style: <span class="hljs-string">'lower'</span>,
        directory: path.join(this.options.baseDir, <span class="hljs-string">'app/controller'</span>),
        initializer: (obj, opt) =&gt; {
          // <span class="hljs-built_in">return</span> class <span class="hljs-keyword">if</span> it exports a <span class="hljs-keyword">function</span>
          // ```js
          // module.exports = app =&gt; {
          //   <span class="hljs-built_in">return</span> class HomeController extends app.Controller {};
          // }
          // ```
          <span class="hljs-keyword">if</span> (is.function(obj) &amp;&amp; !is.generatorFunction(obj) &amp;&amp; !is.class(obj) &amp;&amp; !is.asyncFunction(obj)) {
            obj = obj(this.app);
          }
          <span class="hljs-keyword">if</span> (is.class(obj)) {
            obj.prototype.pathName = opt.pathName;
            obj.prototype.fullPath = opt.path;
            <span class="hljs-built_in">return</span> wrapClass(obj);
          }
          <span class="hljs-keyword">if</span> (is.object(obj)) {
            <span class="hljs-built_in">return</span> wrapObject(obj, opt.path);
          }
          // support generatorFunction <span class="hljs-keyword">for</span> forward compatbility
          <span class="hljs-keyword">if</span> (is.generatorFunction(obj) || is.asyncFunction(obj)) {
            <span class="hljs-built_in">return</span> wrapObject({ <span class="hljs-string">'module.exports'</span>: obj }, opt.path)[<span class="hljs-string">'module.exports'</span>];
          }
          <span class="hljs-built_in">return</span> obj;
        },
      }, opt);
      const controllerBase = opt.directory;

      this.loadToApp(controllerBase, <span class="hljs-string">'controller'</span>, opt);
      this.options.logger.info(<span class="hljs-string">'[egg:loader] Controller loaded: %s'</span>, controllerBase);
      this.timing.end(<span class="hljs-string">'Load Controller'</span>);
    },
  <span class="copy-code-btn">复制代码</span>`</pre>

其加载的路径是： app/controller 下面的 js 文件。然后将对应文件的名称挂载在 app.controller 上面，然后就可以通过如下方式，调用 controller 下面 js 暴露的方法：

  <pre>`module.exports = app =&gt; {
    const { router, controller } = app;
    router.get(<span class="hljs-string">'/'</span>, controller.home.index);
  };
  <span class="copy-code-btn">复制代码</span>`</pre>

上面也就是解决了我们一开始的疑问三:

> - <font color="red">Controller 是如何绑定到 app 上面的 controller 对象上的?</font>

```
  #### `this.loadRouter();`

  这个方法,顾名思义就是去加载 router, 其代码如下：

```

  <pre>`  <span class="hljs-function"><span class="hljs-title">loadRouter</span></span>() {
      this.timing.start(<span class="hljs-string">'Load Router'</span>);
      // 加载 router.js
      this.loadFile(this.resolveModule(path.join(this.options.baseDir, <span class="hljs-string">'app/router'</span>)));
      this.timing.end(<span class="hljs-string">'Load Router'</span>);
    },
  <span class="copy-code-btn">复制代码</span>`</pre>

只会加载对应项目下的`app/router.js`, 也就是路由应该只有一个入口文件.如下 Demo:

  <pre>`<span class="hljs-string">'use strict'</span>;

  /**
   * @param {Egg.Application} app - egg application
   */
  module.exports = app =&gt; {
    const { router, controller } = app;
    router.get(<span class="hljs-string">'/'</span>, controller.home.index);
  };

  <span class="copy-code-btn">复制代码</span>`</pre>

如上代码实现路由。但是我们只是给对应的路由添加了方法， 但是如何去监听路由变化，然后调用不同的方法呢？ 这个涉及到**koa** 中间件的使用方法，我们后续会单独分析中间件, 以及**koa-router**

## 总结

```
1.  egg 的核心模块包括 Application(egg/lib/applicaton.js) <font color="red" size="5">-----&gt;</font> EggApplication(egg/lib/egg.js) <font color="red" size="5">-----&gt;</font> EggCore(egg-core/lib/egg.js) <font color="red" size="5">-----&gt;</font> <font size="5"> KoaApplication(<font color="red">koa</font>)</font>
2.  eggjs 会通过 loadConfig() 去加载配置文件

    <pre>`  <span class="hljs-function"><span class="hljs-title">loadConfig</span></span>() {
        this.loadPlugin();
        super.loadConfig();
      }
    <span class="copy-code-btn">复制代码</span>`</pre>

3.  会通过 load() 方法去加载一系列相关配置
    <pre>`  <span class="hljs-function"><span class="hljs-title">load</span></span>() {
        // app &gt; plugin &gt; core
        this.loadApplicationExtend();
        this.loadRequestExtend();
        this.loadResponseExtend();
        this.loadContextExtend();
        this.loadHelperExtend();
        // app &gt; plugin
        this.loadCustomApp();
        // app &gt; plugin
        this.loadService();
        // app &gt; plugin &gt; core
        this.loadMiddleware();
        // app
        this.loadController();
        // app
        this.loadRouter(); // Dependent on controllers
      }
    <span class="copy-code-btn">复制代码</span>

```
