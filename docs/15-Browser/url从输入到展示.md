---
title: 从输入URL到浏览器展示
---

## 从输入 URL 到浏览器展示

### DNS 解析

- DNS 域名查询

1. DNS 走缓存
2. 开启 Dns 预解析 x-dns-prefetch-control
3. dns-prefetch 强制对 域名做预解析
4. 端内：提前初始化 WebView 并且加载域名开始解析，端外：ifraem

- 根据域名得到 ip 地址

### 检测浏览器本地缓存

- 强缓存

### 建立 TCP 链接 （）

- TCP 三次握手

### 浏览器发起 HTTP 请求（ 总共 2s）

- 协商缓存
- 请求阻塞（同域名 并发 6 个）域名散列

### 服务器响应 HTTP 请求，返回 HTML 内容

- Service Worker
- CDN
- 避免重定向

### 浏览器解析 HTML 代码，并请求 HTML 代码中的资源

#### 解析

- 解析 CSS,生成 CSSOM 树

- 解析 DOM，生成 DOM 树

遇到 script 标签 用 defer 和 async，避免阻塞

- 把 CSSOM 树和 DOM 树 合成 Render 树

#### 布局计算

- 重排

- 重绘

### 浏览器对页面进行渲染呈现给用户（渲染原理）

#### 绘制

#### 光栅化
