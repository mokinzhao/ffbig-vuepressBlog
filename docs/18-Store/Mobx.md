---
title: Mobx
---

我们先清空一下大脑，回到初心，什么是初心？就是我们最初要解决的问题是什么？最初我们其实为了解决应用状态管理的问题，不管是 Redux 还是 MobX，把状态管理好是前提。什么叫把状态管理好，简单来说就是：统一维护公共的应用状态，以统一并且可控的方式更新状态，状态更新后，View 跟着更新。不管是什么思想，达成这个目标就 ok。

Flux 体系的状态管理方式，只是一个选项，但并不代表是唯一的选项。MobX 就是另一个选项。

MobX 背后的哲学很简单：任何源自应用状态的东西都应该自动地获得。译成人话就是状态只要一变，其他用到状态的地方就都跟着自动变。
![mobx](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevjjwdTCqASehPykQpZFvJr3gdq2HkYysQGc4xkSJjic3qzcGvu8ySZ2awCIG1ygF1icS8cGag8ibWOcA/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

看这篇文章的人，大概率会对面向对象的思想比较熟悉，而对函数式编程的思想略陌生。Flux 或者说 Redux 的思想主要就是函数式编程（FP）的思想，所以学习起来会觉得累一些。而 MobX 更接近于面向对象编程，它把 state 包装成可观察的对象，这个对象会驱动各种改变。什么是可观察？就是 MobX 老大哥在看着 state 呢。state 只要一改变，所有用到它的地方就都跟着改变了。这样整个 View 可以被 state 来驱动。

```js
const obj = observable({
  a: 1,
  b: 2,
});
autoRun(() => {
  console.log(obj.a);
});
obj.b = 3; // 什么都没有发生
obj.a = 2; // observe 函数的回调触发了，控制台输出：2
```

上面的 obj，他的 obj.a 属性被使用了，那么只要 obj.a 属性一变，所有使用的地方都会被调用。autoRun 就是这个老大哥，他看着所有依赖 obj.a 的地方，也就是收集所有对 obj.a 的依赖。当 obj.a 改变时，老大哥就会触发所有依赖去更新。

MobX 允许有多个 store，而且这些 store 里的 state 可以直接修改，不用像 Redux 那样每次还返回个新的。这个有点像 Vuex，自由度更高，写的代码更少。不过它也会让代码不好维护。

MobX 和 Flux、Redux 一样，都是和具体的前端框架无关的，也就是说可以用于 React（mobx-react) 或者 Vue（mobx-vue)。一般来说，用到 React 比较常见，很少用于 Vue，因为 Vuex 本身就类似 MobX，很灵活。如果我们把 MobX 用于 React 或者 Vue，可以看到很多 setState() 和 http://this.state.xxx = 这样的处理都可以省了。

还是和上面一样，只介绍思想。具体 MobX 的使用，可以看这里。

#### 对比 Redux

我们直观地上两坨实现计数器代码：

![](https://mmbiz.qpic.cn/mmbiz_gif/meG6Vo0MevjjwdTCqASehPykQpZFvJr3cYzrLbDiaWduriaM5wJ4AsFLO1eCo5A1sZGmzZ8RHOhSg3Bf8VWnHiagA/640?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1)

- Redux：

```js
import React, { Component } from 'react';import {
  createStore,
  bindActionCreators,} from 'redux';import { Provider, connect } from 'react-redux';// ①action typesconst COUNTER_ADD = 'counter_add';const COUNTER_DEC = 'counter_dec';const initialState = {a: 0};// ②reducersfunction reducers(state = initialState, action) {
  switch (action.type) {
  case COUNTER_ADD:
    return {...state, a: state.a+1};
  case COUNTER_DEC:
    return {...state, a: state.a-1};
  default:
    return state
  }}// ③action creatorconst incA = () => ({ type: COUNTER_ADD });const decA = () => ({ type: COUNTER_DEC });const Actions = {incA, decA};class Demo extends Component {
  render() {
    const { store, actions } = this.props;
    return (
      <div>
        <p>a = {store.a}</p>
        <p>
          <button className="ui-btn" onClick={actions.incA}>增加 a</button>
          <button className="ui-btn" onClick={actions.decA}>减少 a</button>
        </p>
      </div>
    );
  }}// ④将state、actions 映射到组件 propsconst mapStateToProps = state => ({store: state});const mapDispatchToProps = dispatch => ({
  // ⑤bindActionCreators 简化 dispatch
  actions: bindActionCreators(Actions, dispatch)})// ⑥connect产生容器组件const Root = connect(
  mapStateToProps,
  mapDispatchToProps)(Demo)const store = createStore(reducers)export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Root />
      </Provider>
    )
  }}

```

- Mobx

```js
import React, { Component } from 'react';import { observable, action } from 'mobx';import { Provider, observer, inject } from 'mobx-react';// 定义数据结构class Store {
  // ① 使用 observable decorator
  @observable a = 0;}// 定义对数据的操作class Actions {
  constructor({store}) {
    this.store = store;
  }
  // ② 使用 action decorator
  @action
  incA = () => {
    this.store.a++;
  }
  @action
  decA = () => {
    this.store.a--;
  }}// ③实例化单一数据源const store = new Store();// ④实例化 actions，并且和 store 进行关联const actions = new Actions({store});// inject 向业务组件注入 store，actions，和 Provider 配合使用// ⑤ 使用 inject decorator 和 observer decorator@inject('store', 'actions')@observerclass Demo extends Component {
  render() {
    const { store, actions } = this.props;
    return (
      <div>
        <p>a = {store.a}</p>
        <p>
          <button className="ui-btn" onClick={actions.incA}>增加 a</button>
          <button className="ui-btn" onClick={actions.decA}>减少 a</button>
        </p>
      </div>
    );
  }}class App extends Component {
  render() {
    // ⑥使用Provider 在被 inject 的子组件里，可以通过 props.store props.actions 访问
    return (
      <Provider store={store} actions={actions}>
        <Demo />
      </Provider>
    )
  }}export default App;
```

#### 区别

Redux 数据流流动很自然，可以充分利用时间回溯的特征，增强业务的可预测性；MobX 没有那么自然的数据流动，也没有时间回溯的能力，但是 View 更新很精确，粒度控制很细。
Redux 通过引入一些中间件来处理副作用；MobX 没有中间件，副作用的处理比较自由，比如依靠 autorunAsync 之类的方法。
Redux 的样板代码更多，看起来就像是我们要做顿饭，需要先买个调料盒装调料，再买个架子放刀叉。。。做一大堆准备工作，然后才开始炒菜；而 MobX 基本没啥多余代码，直接硬来，拿着炊具调料就开干，搞出来为止。
但其实 Redux 和 MobX 并没有孰优孰劣，Redux 比 Mobx 更多的样板代码，是因为特定的设计约束。如果项目比较小的话，使用 MobX 会比较灵活，但是大型项目，像 MobX 这样没有约束，没有最佳实践的方式，会造成代码很难维护，各有利弊。一般来说，小项目建议 MobX 就够了，大项目还是用 Redux 比较合适。

- 优点
  1、学习成本少，基础知识非常简单，跟 Vue 一样的核心原理，响应式编程。

2、写更少的代码，完成更多的事。不会跟 Redux 一样写非常多的样板代码。

3、使组件更加颗粒化拆分。

- 缺点
  1、过于自由，MobX 提供的约定及模版代码很少，如果团队不做一些约定，容易导致团队代码风格不统一。

2、可拓展，可维护性，也许你会担心 Mobx 能不能适应后期项目发展壮大呢？确实 Mobx 更适合用在中小型项目中，但这并不表示其不能支撑大型项目，关键在于大型项目通常需要特别注意可拓展性，可维护性，相比而言，规范的 Redux 更有优势，而 Mobx 更自由，需要我们自己制定一些规则来确保项目后期拓展，维护难易程度；
