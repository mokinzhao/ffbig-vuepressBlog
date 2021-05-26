---
title: Dva
---

Dva 是什么呢？官方的定义是：dva 首先是一个基于 redux 和 redux-saga 的数据流方案，然后为了简化开发体验，dva 还额外内置了 react-router 和 fetch，所以也可以理解为一个轻量级的应用框架。

简单理解，就是让使用 react-redux 和 redux-saga 编写的代码组织起来更合理，维护起来更方便。

之前我们聊了 redux、react-redux、redux-saga 之类的概念，大家肯定觉得头昏脑涨的，什么 action、reducer、saga 之类的，写一个功能要在这些 js 文件里面不停的切换。

dva 做的事情很简单，就是让这些东西可以写到一起，不用分开来写了。比如：

```js
app.model({
  // namespace - 对应 reducer 在 combine 到 rootReducer 时的 key 值
  namespace: "products",
  // state - 对应 reducer 的 initialState
  state: {
    list: [],
    loading: false,
  },
  // subscription - 在 dom ready 后执行
  subscriptions: [
    function (dispatch) {
      dispatch({ type: "products/query" });
    },
  ],
  // effects - 对应 saga，并简化了使用
  effects: {
    ["products/query"]: function* () {
      yield call(delay(800));
      yield put({
        type: "products/query/success",
        payload: ["ant-tool", "roof"],
      });
    },
  },
  // reducers - 就是传统的 reducers
  reducers: {
    ["products/query"](state) {
      return { ...state, loading: true };
    },
    ["products/query/success"](state, { payload }) {
      return { ...state, loading: false, list: payload };
    },
  },
});
```

以前书写的方式是创建 sagas/products.js, reducers/products.js 和 actions/products.js，然后把 saga、action、reducer 啥的分开来写，来回切换，现在写在一起就方便多了。

比如传统的 TODO 应用，用 redux + redux-saga 来表示结构，就是这样：
![](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevjjwdTCqASehPykQpZFvJr3TxNlFUU00ET74u4Y04D2SSZhjxwtIwtFN4nCIORmHVkEf7nb9mYJcg/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

saga 拦截 add 这个 action, 发起 http 请求, 如果请求成功, 则继续向 reducer 发一个 addTodoSuccess 的 action, 提示创建成功, 反之则发送 addTodoFail 的 action 即可。

如果使用 Dva，那么结构图如下：
![](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevjjwdTCqASehPykQpZFvJr3tuHOOqibBXubHBgHV1w56awAjFuOsePkRco0hv0Oibz9AqID7hZemhPw/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)
整个结构变化不大，最主要的就是把 store 及 saga 统一为一个 model 的概念（有点类似 Vuex 的 Module），写在了一个 js 文件里。增加了一个 Subscriptions, 用于收集其他来源的 action，比如快捷键操作。

```js
app.model({
  namespace: "count",
  state: {
    record: 0,
    current: 0,
  },
  reducers: {
    add(state) {
      const newCurrent = state.current + 1;
      return {
        ...state,
        record: newCurrent > state.record ? newCurrent : state.record,
        current: newCurrent,
      };
    },
    minus(state) {
      return { ...state, current: state.current - 1 };
    },
  },
  effects: {
    *add(action, { call, put }) {
      yield call(delay, 1000);
      yield put({ type: "minus" });
    },
  },
  subscriptions: {
    keyboardWatcher({ dispatch }) {
      key("⌘+up, ctrl+up", () => {
        dispatch({ type: "add" });
      });
    },
  },
});
```

之前我们说过约定优于配置的思想，Dva 正式借鉴了这个思想。
