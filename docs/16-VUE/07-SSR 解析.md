---
title: SSR-Nuxt使用与源码浅析
---

# **（SSR）服务端渲染的优缺点**
### **优点：**
1.前端耗时少，首屏加载速度快。因为后端拼接完了html，浏览器只需要直接渲染出来。

2.有利于SEO。因为在后端有完整的html页面，所以爬虫更容易爬取获得信息，更有利于seo。

3.无需占用客户端资源。即解析模板的工作完全交由后端来做，客户端只要解析标准的html页面即可，这样对于客户端的资源占用更少，尤其是移动端，也可以更省电。

4.后端生成静态化文件。即生成缓存片段，这样就可以减少数据库查询浪费的时间了，且对于数据变化不大的页面非常高效 。

### **缺点：**
1.不利于前后端分离，开发效率低。(无框架前)

2.占用服务器端资源。

即服务器端完成html模板的解析，如果请求较多，会对服务器造成一定的访问压力。而如果使用前端渲染，就是把这些解析的压力分摊了前端，而这里确实完全交给了一个服务器。

# # Nuxt.js起源
2016 年 10 月 25 日， [zeit.co](https://zeit.co/) 背后的团队对外发布了 [Next.js](https://zeit.co/blog/next) ，一个 React 的服务端渲染应用框架。几小时后，与 Next.js 异曲同工，一个基于 [Vue.js](https://vuejs.org/) 的服务端渲染应用框架应运而生，我们称之为：Nuxt.js。

Nuxt 是服务器呈现的简约应用程序的框架，通过对客户端和服务端基础架构的抽象，Nuxt.js 可以让开发者更专注于页面的UI渲染。作用就是在 node.js 上进一步封装，然后省去我们搭建服务端环境的步骤，只需要遵循这个库的一些规则就能轻松实现 SSR。

# 作用及特性
* 通过对客户端/服务端基础架构的抽象组织，Nuxt.js 主要关注的是应用的 **UI 渲染**。
* Nuxt.js 预设了利用 Vue.js 开发**服务端渲染**的应用所需要的各种配置。
* 支持 Vue.js 应用的静态化，通过 nuxt generate 命令实现。
* 基于 Vue.js
* 自动代码分层
* 服务端渲染
* 强大的路由功能，支持异步数据
* 静态文件服务
* ES2015+ 语法支持
* 打包和压缩 JS 和 CSS
* HTML 头部标签管理
* 本地开发支持热加载
* 集成 ESLint
* 支持各种样式预处理器：SASS、LESS、Stylus 等等
* 支持 HTTP/2 推送

# 核心原理
![图片](https://user-gold-cdn.xitu.io/2019/12/13/16efe78bba9a0ba2?w=1000&h=212&f=png&s=61053)

Nuxt.js 集成了以下组件/框架，用于开发完整而强大的 Web 应用：

* [Vue 2](https://github.com/vuejs/vue)
* [Vue-Router](https://github.com/vuejs/vue-router)
* [Vuex](https://github.com/vuejs/vuex) (当配置了 [Vuex 状态树配置项](https://zh.nuxtjs.org/guide/vuex-store) 时才会引入)
* [Vue 服务器端渲染](https://ssr.vuejs.org/en/) (排除使用 [mode: 'spa'](https://zh.nuxtjs.org/api/configuration-mode) )
* [Vue-Meta](https://github.com/nuxt/vue-meta)

压缩并 gzip 后，总代码大小为：**57kb** （如果使用了 Vuex 特性的话为 60kb）。

另外，Nuxt.js 使用 [Webpack](https://github.com/webpack/webpack) 和 [vue-loader](https://github.com/vuejs/vue-loader) 、 [babel-loader](https://github.com/babel/babel-loader) 来处理代码的自动化构建工作（如打包、代码分层、压缩等等）。

**work flow：**

![图片](https://user-gold-cdn.xitu.io/2019/12/13/16efe78b7c2b0762?w=460&h=600&f=png&s=28394)
# 安装(略)
详见 [https://zh.nuxtjs.org/guide/installation](https://zh.nuxtjs.org/guide/installation)

# 目录结构
```
├── assets           //用于组织未编译的静态资源如 LESS、SASS 或 JavaScript
│   └── README.md
├── components       //用于组织应用的 Vue.js 组件。Nuxt.js 不会扩展增强该目录下 Vue.js 组件，即这些组件不会像页面组件那样有 asyncData 方法的特性
├── layouts    //布局目录 layouts 用于组织应用的布局组件。若无额外配置，该目录不能被重命名。
│   ├── README.md
│   └── default.vue
├── middleware    //目录用于存放应用的中间件
│   └── README.md
├── nuxt.config.js  //nuxt 配置文件
├── pages           //放page页面，自动生产路由
│   ├── README.md
│   ├── index.vue
│ 
├── plugins    //用于组织那些需要在 根vue.js应用 实例化之前需要运行的 插件
│   ├── README.md
│   └── axios.js
├── server                
│   └── index.js           //服务配置
├── static           
│   ├── README.md     //存放静态文件，不被编译
│   ├── favicon.ico
│   ├── icon.png
│   └── sw.js
├── store                 //vuex状态
│   ├── README.md
│   ├── index.js
│   └── webLogin.js
```

# 常用 API
### 生命周期
Nuxt扩展了Vue的生命周期

```
export default {
  middleware (ctx) {}, //服务端
  validate (ctx) {}, // 服务端
  asyncData (ctx) {}, //服务端
  fetch (ctx) {}, // store数据加载
  beforeCreate () {  // 服务端和客户端都会执行},
  created () { // 服务端和客户端都会执行 },
  beforeMount () {}, 
  mounted () {} // 客户端
}
```
# 
### context 对象
context 的可用属性一览:

| 属性字段   | 类型   | 可用   | 描述   | 
|:----|:----|:----|:----|
| app   | Vue 根实例   | 客户端 & 服务端   | 包含所有插件的 Vue 根实例。例如：在使用 axios 的时候，你想获取 $axios 可以直接通过 context.app.$axios 来获取   | 
| isClient   | Boolean   | 客户端 & 服务端   | 是否来自客户端渲染（废弃。请使用 process.client ）   | 
| isServer   | Boolean   | 客户端 & 服务端   | 是否来自服务端渲染（废弃。请使用 process.server ）   | 
| isStatic   | Boolean   | 客户端 & 服务端   | 是否来自 nuxt generate 静态化（预渲染）（废弃。请使用 process.static ）   | 
| isDev   | Boolean   | 客户端 & 服务端   | 是否是开发 dev 模式，在生产环境的数据缓存中用到   | 
| isHMR   | Boolean   | 客户端 & 服务端   | 是否是通过模块热替换 webpack hot module replacement (*仅在客户端以 dev 模式*)   | 
| route   | [Vue Router 路由](https://router.vuejs.org/zh/api/#%E8%B7%AF%E7%94%B1%E5%AF%B9%E8%B1%A1%E5%B1%9E%E6%80%A7)   | 客户端 & 服务端   | Vue Router 路由实例   | 
| store   | [Vuex 数据](https://vuex.vuejs.org/zh/api/)   | 客户端 & 服务端   | Vuex.Store 实例。**只有**[vuex 数据流](https://zh.nuxtjs.org/guide/vuex-store)**存在相关配置时可用**   | 
| env   | Object   | 客户端 & 服务端   | nuxt.config.js 中配置的环境变量，见 [环境变量 api](https://zh.nuxtjs.org/api/configuration-env)   | 
| params   | Object   | 客户端 & 服务端   | route.params 的别名   | 
| query   | Object   | 客户端 & 服务端   | route.query 的别名   | 
| req   | [http.Request](https://nodejs.org/api/http.html#http_class_http_incomingmessage)   | 服务端   | Node.js API 的 Request 对象。如果 Nuxt 以中间件形式使用的话，这个对象就根据你所使用的框架而定。*nuxt generate 不可用*   | 
| res   | [http.Response](https://nodejs.org/api/http.html#http_class_http_serverresponse)   | 服务端   | Node.js API 的 Response 对象。如果 Nuxt 以中间件形式使用的话，这个对象就根据你所使用的框架而定。*nuxt generate 不可用*   | 
| redirect   | Function   | 客户端 & 服务端   | 用这个方法重定向用户请求到另一个路由。状态码在服务端被使用，默认 302 redirect([status,] path [, query])   | 
| error   | Function   | 客户端 & 服务端   | 用这个方法展示错误页：error(params) 。params 参数应该包含 statusCode 和 message 字段   | 
| nuxtState   | Object   | 客户端   | Nuxt 状态，在使用 beforeNuxtRender 之前，用于客户端获取 Nuxt 状态，仅在 universal 模式下可用   | 
| beforeNuxtRender(fn)   | Function   | 服务端   | 使用此方法更新 __NUXT__ 在客户端呈现的变量，fn 调用 (可以是异步) { Components, nuxtState } ，参考 [示例](https://github.com/nuxt/nuxt.js/blob/cf6b0df45f678c5ac35535d49710c606ab34787d/test/fixtures/basic/pages/special-state.vue)   | 



### asyncData 函数
* **类型：**Function

asyncData 方法会在组件（**限于页面组件**）每次加载之前被调用。它可以在服务端或路由更新之前被调用。在这个方法被调用的时候，第一个参数被设定为当前页面的**上下文对象**，你可以利用 asyncData 方法来获取数据并返回给当前组件。

```
export default {
  data () {
    return { project: 'default' }
  },
  asyncData (context) {
    return { project: 'nuxt' }
  }
}
```
注意：由于 asyncData 方法是在组件 **初始化** 前被调用的，所以在方法内是没有办法通过 this 来引用组件的实例对象。

### fetch 函数
>*fetch 方法用于在渲染页面前填充应用的状态树（store）数据， 与 asyncData 方法类似，不同的是它不会设置组件的数据。*
* **类型：**Function

如果页面组件设置了 fetch 方法，它会在组件每次加载前被调用（在服务端或切换至目标路由之前）。

fetch 方法的第一个参数是页面组件的 [上下文对象](https://zh.nuxtjs.org/api/#%E4%B8%8A%E4%B8%8B%E6%96%87%E5%AF%B9%E8%B1%A1) context，我们可以用 fetch 方法来获取数据填充应用的vuex状态树。为了让获取过程可以异步，你需要**返回一个 Promise**，Nuxt.js 会等这个 promise 完成后再渲染组件。

**警告**: 您无法在内部使用 this 获取**组件实例**，fetch 是在**组件初始化之前**被调用

例如 pages/index.vue：

```
<template>
  <h1>Stars: {{ $store.state.stars }}</h1>
</template>
<script>
export default {
  fetch ({ store, params }) {
    return axios.get('http://my-api/stars')
    .then((res) => {
      store.commit('setStars', res.data)
    })
  }
}
</script>
你也可以使用 async 或 await 的模式简化代码如下：
<template>
  <h1>Stars: {{ $store.state.stars }}</h1>
</template>
<script>
export default {
  async fetch ({ store, params }) {
    let { data } = await axios.get('http://my-api/stars')
    store.commit('setStars', data)
  }
}
</script>
```
如果要在 fetch 中调用并操作 store，请使用 store.dispatch，但是要确保在内部使用 async / await 等待操作结束：
```
<script>
export default {
  async fetch ({ store, params }) {
    await store.dispatch('GET_STARS');
  }
}
</script>
store/index.js
// ...
export const actions = {
  async GET_STARS ({ commit }) {
    const { data } = await axios.get('http://my-api/stars')
    commit('SET_STARS', data)
  }
}
```
**监听 query 字符串的改变**
默认情况下，不会在查询字符串更改时调用 fetch 方法。如果想更改此行为，例如，在编写分页组件时，您可以设置通过页面组件的 watchQuery 属性来监听参数的变化。了解更多有关 [API watchQuery page](https://zh.nuxtjs.org/api/pages-watchquery) 的信息。


**增加用户体验的两个插件**

### @nuxtjs/toast模块 
toast可以说是很常用的功能，一般的UI框架都会有这个功能。但如果你的站点没有使用UI框架，而alert又太丑，不妨引入该模块：

 

```
npm install @nuxtjs/toast
```
然后在nuxt.config.js中引入

 

```
module.exports = {
    modules: [
    '@nuxtjs/toast',
    ['@nuxtjs/dotenv', { filename: '.env.prod' }] // 指定打包时使用的dotenv
  ],
  toast: {// toast模块的配置
    position: 'top-center', 
    duration: 2000
  }
}
```
这样，nuxt就会在全局注册$toast方法供你使用，非常方便：

 

```
this.$toast.error('服务器开小差啦~~')
this.$toast.error('请求成功~~')
```

### loading方法
nuxt内置了页面顶部[loading进度条的样式](https://zh.nuxtjs.org/api/configuration-loading/#loading-%E5%B1%9E%E6%80%A7%E9%85%8D%E7%BD%AE) 推荐使用，提供页面跳转体验。

```
//打开
this.$nuxt.$loading.start() 
//完成 
this.$nuxt.$loading.finish()
```

更多 API 详见官网 [https://zh.nuxtjs.org/api](https://zh.nuxtjs.org/api)

# 源码浅析
源码地址：[https://github.com/nuxt/nuxt.js](https://github.com/nuxt/nuxt.js)

源码目录：

![图片](https://user-gold-cdn.xitu.io/2019/12/13/16efe78b7def391e?w=1293&h=375&f=png&s=19143)




### 1、通过 .nuxt 文件来执行我们的工作流程
![图片](https://user-gold-cdn.xitu.io/2019/12/13/16efe78b47c0c8db?w=340&h=285&f=png&s=46013)

这个是我们项目生成的临时文件，我们项目运行时候配置的文件都是在这里，大家可以看到这里的路由文件，没错，这个就是系统自动给我们配置的路由文件，根据我们的 pages 文件夹路径生成的，大家还可以看到，由app.js ，client.js 和 server.js 这两个就是类似我们的 SSR 中配置的那个 server.js 入口文件，然后还有 middleware.js 中间件文件，其实这个时候我们大概能懂了，上边我们说的工作流程，走的就是这个 临时文件.nuxt 文件夹中的内容，但是这个文件夹是如何生成的呢，大家请往下看。


### 2、.nuxt 是如何产生的
 

本文主要研究nuxt的运行原理,分析它从接收一条nuxt指令,到完成指令背后所发生的一系列事情,在开始本文之前,请读者务必亲自体验过nuxt.js的使用,并且具备一定的vue.js相关开发经验。

 

通过查看nuxt.js工程目录下的package.json文件,我们可以看到下列几条指令:

 

```
"scripts": { "dev": "nuxt",           // 开启一个监听3000端口的服务器,同时提供hot-reloading功能
    "build": "nuxt build", //构建整个应用,压缩合并JS和CSS文件(用于生产环境)
    "start": "nuxt start", // 开启一个生产模式的服务器(必须先运行nuxt build命令)
    "generate": "nuxt generate" //构建整个应用,并为每一个路由生成一个静态页面(用于静态服务器)
} 
```
 
咱们还从来没有看过我们的依赖包哈，今天就来看看，打开我们的 node_modules 文件夹下的 nuxt工程文件夹 进入到到bin目录,我们可以看到几个文件:

 

![图片](https://user-gold-cdn.xitu.io/2019/12/13/16efe78b673d7bad?w=1492&h=584&f=png&s=241409)   

 

  

咱们就说一下 dev 是如何工作的，咱们先找到一个片段，发现基本是执行了以下几个步骤：

 

```
  async run (cmd) {
    const { argv } = cmd
    await this.startDev(cmd, argv, argv.open)
  },

  async startDev (cmd, argv) {
    let nuxt
    try {
      nuxt = await this._listenDev(cmd, argv)
    } catch (error) {
      consola.fatal(error)
      return
    }
    try {
      await this._buildDev(cmd, argv, nuxt)
    } catch (error) {
      await nuxt.callHook('cli:buildError', error)
      consola.error(error)
    }
    return nuxt
  },
```
 
 

  

![图片](https://user-gold-cdn.xitu.io/2019/12/13/16efe78ba384700a?w=756&h=96&f=png&s=40023)

 

 

 

 

那什么是 nuxt() 类，它又是执行了什么样的方法呢？

 

![图片](https://user-gold-cdn.xitu.io/2019/12/13/16efe78c1dd55aa1?w=527&h=960&f=png&s=29105)

 

 

  

 

 

 

 

上图中每一步都可以在具体的代码中自行浏览。在用户输入指令并实例化了Nuxt()类以后,实例化

 

同时,Nuxt()类也提供了一个close()公有方法,用于关闭其所开启的服务器。

 

### 3、builder.build() 进行编译
 

 

![图片](https://user-gold-cdn.xitu.io/2019/12/13/16efe78c5a6815ee?w=519&h=762&f=png&s=24982)

 

 

 

 

简单来说,build()方法在判断完运行条件后,会先初始化产出目录.nuxt,然后通过不同目录下的文件结构来生成一系列的配置,写入模板文件后输出到.nuxt目录。接下来,则会根据不同的开发环境来调用不同的webpack配置,运行不同的webpack构建方案。

 

### 4、render.js文件 打包输出渲染
 

在nuxt/lib目录下找到render.js文件,它包含着我们即将要分析的三个方法:render(), renderRoute(), renderAndGetWindow()。

 

 

  

![图片](https://user-gold-cdn.xitu.io/2019/12/13/16efe78cc87ddcc4?w=1036&h=765&f=png&s=259231)

 

 

 

 

通过这张图片,我们可以知道nuxt对于处理“客户端渲染”与“服务端渲染”的逻辑其实是非常清晰的。

 

* 首先,在render()方法在处理完一系列的路径问题后,会调用renderRoute()方法,获取响应所需内容并完成响应。
* 其中renderRoute()方法会判断当前响应是否应执行服务端渲染。如果是,则调用vue提供的bundleRenderer()方法,把html内容渲染完毕以后再整体输出;如果不是,则直接输出一个<div></div>字符串,交由客户端渲染。
* 最后,通过renderAndGetWindow()来检查输出的html是否存在问题,然后发出通知,表明html可用。






# 打包部署
上传全部代码到自己到服务器上执行
编译打包：

```
npm run build
npm run start
```
建议部署方式Docker+K8S




