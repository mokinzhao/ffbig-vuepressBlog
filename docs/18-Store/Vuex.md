---
title: Vuex
---

Vuex 主要用于 Vue，和 Flux，Redux 的思想很类似。
![vuex-flow](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevjjwdTCqASehPykQpZFvJr3ibCCcZpTbICHL6wUP3nv7t81mH1kxWtKDeuLH4vvWASCWHyKebpXphw/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

#### Store

每一个 Vuex 里面有一个全局的 Store，包含着应用中的状态 State，这个 State 只是需要在组件中共享的数据，不用放所有的 State，没必要。这个 State 是单一的，和 Redux 类似，所以，一个应用仅会包含一个 Store 实例。单一状态树的好处是能够直接地定位任一特定的状态片段，在调试的过程中也能轻易地取得整个当前应用状态的快照。

Vuex 通过 store 选项，把 state 注入到了整个应用中，这样子组件能通过 this.\$store 访问到 state 了。

```js
const app = new Vue({
  el: '#app',
  // 把 store 对象提供给 “store” 选项，这可以把 store 的实例注入所有的子组件
  store,
  components: { Counter },
  template: `
    <div class="app">
      <counter></counter>
    </div>
  `})const Counter = {
  template: `<div>{{ count }}</div>`,
  computed: {
    count () {
      return this.$store.state.count
    }
  }}

```

State 改变，View 就会跟着改变，这个改变利用的是 Vue 的响应式机制。

#### Mutation

显而易见，State 不能直接改，需要通过一个约定的方式，这个方式在 Vuex 里面叫做 mutation，更改 Vuex 的 store 中的状态的唯一方法是提交 mutation。Vuex 中的 mutation 非常类似于事件：每个 mutation 都有一个字符串的 事件类型 (type) 和 一个 回调函数 (handler)。

```js
const store = new Vuex.Store({
  state: {
    count: 1,
  },
  mutations: {
    increment(state) {
      // 变更状态
      state.count++;
    },
  },
});
```

触发 mutation 事件的方式不是直接调用，比如 increment(state) 是不行的，而要通过 store.commit 方法：

```js
store.commit("increment");
```

注意：mutation 都是同步事务。

mutation 有些类似 Redux 的 Reducer，但是 Vuex 不要求每次都搞一个新的 State，可以直接修改 State，这块儿又和 Flux 有些类似。具尤大的说法，Redux 强制的 immutability，在保证了每一次状态变化都能追踪的情况下强制的 immutability 带来的收益很有限，为了同构而设计的 API 很繁琐，必须依赖第三方库才能相对高效率地获得状态树的局部状态，这些都是 Redux 不足的地方，所以也被 Vuex 舍掉了。

到这里，其实可以感觉到 Flux、Redux、Vuex 三个的思想都差不多，在具体细节上有一些差异，总的来说都是让 View 通过某种方式触发 Store 的事件或方法，Store 的事件或方法对 State 进行修改或返回一个新的 State，State 改变之后，View 发生响应式改变。

#### Action

到这里又该处理异步这块儿了。mutation 是必须同步的，这个很好理解，和之前的 reducer 类似，不同步修改的话，会很难调试，不知道改变什么时候发生，也很难确定先后顺序，A、B 两个 mutation，调用顺序可能是 A -> B，但是最终改变 State 的结果可能是 B -> A。

对比 Redux 的中间件，Vuex 加入了 Action 这个东西来处理异步，Vuex 的想法是把同步和异步拆分开，异步操作想咋搞咋搞，但是不要干扰了同步操作。View 通过 store.dispatch(‘increment’) 来触发某个 Action，Action 里面不管执行多少异步操作，完事之后都通过 store.commit(‘increment’) 来触发 mutation，一个 Action 里面可以触发多个 mutation。所以 Vuex 的 Action 类似于一个灵活好用的中间件。

Vuex 把同步和异步操作通过 mutation 和 Action 来分开处理，是一种方式。但不代表是唯一的方式，还有很多方式，比如就不用 Action，而是在应用内部调用异步请求，请求完毕直接 commit mutation，当然也可以。

Vuex 还引入了 Getter，这个可有可无，只不过是方便计算属性的复用。

Vuex 单一状态树并不影响模块化，把 State 拆了，最后组合在一起就行。Vuex 引入了 Module 的概念，每个 Module 有自己的 state、mutation、action、getter，其实就是把一个大的 Store 拆开。
总的来看，Vuex 的方式比较清晰，适合 Vue 的思想，在实际开发中也比较方便。

#### 对比 Redux

Redux：view——>actions——>reducer——>state 变化——>view 变化（同步异步一样）

Vuex：view——>commit——>mutations——>state 变化——>view 变化（同步操作） view——>dispatch——>actions——>mutations——>state 变化——>view 变化（异步操作）
