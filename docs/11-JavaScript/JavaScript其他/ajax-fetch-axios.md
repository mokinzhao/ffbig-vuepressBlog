---
title: Ajax/Axios/Fetch详解
---

### Ajax

- 基于 XMLHttpRequest
  基于 回调函数管理方式，不利于管理，异步操作繁琐。容易产生回调地狱

### Axios

- 基于 XMLHttpRequest
  基于 Promise 封装管理，方便异步操作，可以链式管理

- 使用场景兼容 IE 浏览器，对外访问的网站

#### Axios 二次封装

- axios 请求的缓存与重复请求过滤的封装（plus）
  参考：
  [axios 请求的缓存与重复请求过滤的封装（plus）](https://juejin.cn/post/6844904167840940040)

```js
//全局配置
axios.defaults.baseURL = "127.1.1"; //请求地址前缀
axios.defaults.withCredentials = true; //跨域是否携带token
axios.defaults.timeout = 2000 * 10; //请求超时(毫秒)

//请求拦截器
axios.interceptors.request.use((config) => {});

//响应拦截器
axios.interceptors.response.use(
  function onFulfilled(respones) {},
  function onRejected(reason) {}
);
```

### Fetch

- Es6 里面直接带的（不兼容 ie 浏览器）本身就是基于 Promise 封装，和 XMLHttpRequest 没有任何关系，是浏览器新提供的一种前后端数据通信方案

- 不兼容 IE 浏览器，常用于内部管理系统
- 参考：
  [MDN FetchAPI](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API)

### 总结

- 三者区别：
  Ajax 和 Axios 都基于 XMLHttpRequest 的封装，Fetch 直接用（Es6，不兼容 IE）和 XMLHttpRequest 没有任何关系
