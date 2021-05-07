---
title: Ajax/Axios/Fetch详解
---

### Ajax

- 基于 XMLHttpRequest
  基于 回调函数管理方式，不利于管理，异步操作繁琐。容易产生回调地狱

### Axios

Axios 是一个基于 Promise 的 HTTP 客户端，拥有以下特性：

- 基于 XMLHttpRequest
- 支持 Promise 封装管理，方便异步操作，可以链式管理
- 能够拦截请求和响应；
- 能够转换请求和响应数据；
- 客户端支持防御 CSRF 攻击；
- 同时支持浏览器和 Node.js 环境；
- 能够取消请求及自动转换 JSON 数据。
- 在浏览器端 Axios 支持大多数主流的浏览器，比如 Chrome、Firefox、Safari 和 IE 11

#### Axios 二次封装

```js
import axios from "axios";
import qs from "qs";

const isPlainObject = function isPlainObject(obj) {
  let proto, Ctor;
  if (!obj || Object.prototype.toString.call(obj) !== "[object Object]")
    return false;
  proto = Object.getPrototypeOf(obj);
  if (!proto) return true;
  Ctor = proto.hasOwnProperty("constructor") && proto.constructor;
  return typeof Ctor === "function" && Ctor === Object;
};

//全局配置
axios.defaults.baseURL = "http://127.0.0.1:9999";
axios.defaults.timeout = 10000;
axios.defaults.withCredentials = true;
axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded";
axios.defaults.transformRequest = function (data) {
  if (!isPlainObject(data)) return data;
  return qs.stringify(data);
};

//请求拦截器
axios.interceptors.request.use((config) => {
  let token = localStorage.getItem("token");
  if (token) config.headers["Authorization"] = token;
  return config;
});
//响应拦截器
axios.interceptors.response.use(
  function onfulfilled(response) {
    return response.data;
  },
  function onrejected(reason) {
    // @1 服务器返回信息，状态码不是以2开始
    if (reason.response) {
      switch (reason.response.status) {
        case 400:
          // ...
          break;
      }
    }

    // @2 服务器没有返回的信息「请求超时或者中断」
    if (reason.code === "ECONNABORTED") {
      // ...
    }

    // @3 服务器没有返回的信息「断网了」
    if (!navigator.onLine) {
      // ...
    }

    return Promise.reject(reason);
  }
);

export default axios;
```

- 更多参考：
  [axios 请求的缓存与重复请求过滤的封装（plus）](https://juejin.cn/post/6844904167840940040)
  [77.9K 的 Axios 项目有哪些值得借鉴的地方](https://mp.weixin.qq.com/s?__biz=MzI2MjcxNTQ0Nw==&mid=2247486544&idx=1&sn=70b610d286d1ecd44b53a1f128a3669f&scene=21#wechat_redirect)
  [Axios 如何取消重复请求？](https://mp.weixin.qq.com/s/By-iXlONjSZLKFG2Xd7rpg)
  [Axios 如何缓存请求数据？](https://mp.weixin.qq.com/s/jdMdnaT5ZvXWEohtIom6WA)

### Fetch

- Es6 里面直接带的（不兼容 ie 浏览器）本身就是基于 Promise 封装，和 XMLHttpRequest 没有任何关系，是浏览器新提供的一种前后端数据通信方案

- 不兼容 IE 浏览器，常用于内部管理系统
- 参考：
  [MDN FetchAPI](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API)

#### 二次封装

```js
import qs from "qs";
const isPlainObject = function isPlainObject(obj) {
  let proto, Ctor;
  if (!obj || Object.prototype.toString.call(obj) !== "[object Object]")
    return false;
  proto = Object.getPrototypeOf(obj);
  if (!proto) return true;
  Ctor = proto.hasOwnProperty("constructor") && proto.constructor;
  return typeof Ctor === "function" && Ctor === Object;
};

let baseURL = "http://127.0.0.1:9999",
  inital = {
    method: "GET",
    params: null,
    body: null,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

export default function request(url, config) {
  if (typeof url !== "string") throw new TypeError("url must be required!");
  if (!isPlainObject(config)) config = {};
  if (config.headers) {
    if (!isPlainObject(config.headers)) config.headers = {};
    config.headers = Object.assign({}, inital.headers, config.headers);
  }
  let { method, params, body, headers } = Object.assign({}, inital, config);

  // 处理URL
  if (!/^http(s?):\/\//i.test(url)) url = baseURL + url;
  if (params != null) {
    if (isPlainObject(params)) params = qs.stringify(params);
    url += `${url.includes("?") ? "&" : "?"}${params}`;
  }

  // 处理请求主体
  let isPost = /^(POST|PUT|PATCH)$/i.test(method);
  if (isPost && body != null && isPlainObject(body)) {
    body = qs.stringify(body);
  }

  // 发送请求
  config = {
    method: method.toUpperCase(),
    headers,
  };
  if (isPost) config.body = body;
  return fetch(url, config)
    .then((response) => {
      // 只要服务器有返回值，则都认为promise是成功的，不论状态码是啥
      let { status, statusText } = response;
      if (status >= 200 && status < 300) {
        // response.json():把服务器获取的结果变为json格式对象，返回的一个promise实例
        return response.json();
      }
      return Promise.reject({
        code: "STATUS ERROR",
        status,
        statusText,
      });
    })
    .catch((reason) => {
      // @1 状态码错误
      if (reason && reason.code === "STATUS ERROR") {
        // ...
      }

      // @2 断网
      if (!navigator.onLine) {
        // ...
      }

      return Promise.reject(reason);
    });
}
```

### 总结

- 三者区别：
  Ajax 和 Axios 都基于 XMLHttpRequest 的封装，Fetch 直接用（Es6，不兼容 IE）和 XMLHttpRequest 没有任何关系
