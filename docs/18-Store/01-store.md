---
title: 状态管理的演进-Flux/Redux/Redux-saga/Recil
---

!['kasong'](https://mmbiz.qpic.cn/mmbiz_png/QibeeJCUD7SQcC4612ITyDTpfib4PXxqCY46shfzW3ibeyxIuffXficr8tMYB0fPbYeXLnIUZj3KICxKML3eq6CPWw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

#### Flux

Flux 其实是一种思想，就像 MVC，MVVM 之类的，他给出了一些基本概念，所有的框架都可以根据他的思想来做一些实现。

Flux 把一个应用分成了 4 个部分：View Action Dispatcher Store
![](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevjjwdTCqASehPykQpZFvJr3BLBgYe6IK5QRGeBYLvKdcaShXpImTNbzFJvibLiaEu4XIUpFseCBrTZw/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)
比如我们搞一个应用，显而易见，这个应用里面会有一堆的 View，这个 View 可以是 Vue 的，也可以是 React 的，啥框架都行，啥技术都行。

View 肯定是要展示数据的，所谓的数据，就是 Store，Store 很容易明白，就是存数据的地方。当然我们可以把 Store 都放到一起，也可以分开来放，所以就有一堆的 Store。但是这些 View 都有一个特点，就是 Store 变了得跟着变。

View 怎么跟着变呢？一般 Store 一旦发生改变，都会往外面发送一个事件，比如 change，通知所有的订阅者。View 通过订阅也好，监听也好，不同的框架有不同的技术，反正 Store 变了，View 就会变。

View 不是光用来看的，一般都会有用户操作，用户点个按钮，改个表单啥的，就需要修改 Store。Flux 要求，View 要想修改 Store，必须经过一套流程，有点像我们刚才 Store 模式里面说的那样。视图先要告诉 Dispatcher，让 Dispatcher dispatch 一个 action，Dispatcher 就像是个中转站，收到 View 发出的 action，然后转发给 Store。比如新建一个用户，View 会发出一个叫 addUser 的 action 通过 Dispatcher 来转发，Dispatcher 会把 addUser 这个 action 发给所有的 store，store 就会触发 addUser 这个 action，来更新数据。数据一更新，那么 View 也就跟着更新了。

这个过程有几个需要注意的点：Dispatcher 的作用是接收所有的 Action，然后发给所有的 Store。这里的 Action 可能是 View 触发的，也有可能是其他地方触发的，比如测试用例。转发的话也不是转发给某个 Store，而是所有 Store。Store 的改变只能通过 Action，不能通过其他方式。也就是说 Store 不应该有公开的 Setter，所有 Setter 都应该是私有的，只能有公开的 Getter。具体 Action 的处理逻辑一般放在 Store 里。

听听描述看看图，可以发现，Flux 的最大特点就是数据都是单向流动的。

#### Redux

Flux 有一些缺点（特点），比如一个应用可以拥有多个 Store，多个 Store 之间可能有依赖关系；Store 封装了数据还有处理数据的逻辑。

所以大家在使用的时候，一般会用 Redux，他和 Flux 思想比较类似，也有差别。
![Redux](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevjjwdTCqASehPykQpZFvJr3gOg9dyK4aV4BrECFGvM4h7mo7ic33ibtOJwPTWQcL4u8ibia5UObnleDJQ/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

- Store

Redux 里面只有一个 Store，整个应用的数据都在这个大 Store 里面。Store 的 State 不能直接修改，每次只能返回一个新的 State。Redux 整了一个 createStore 函数来生成 Store。

```js
import { createStore } from "redux";
const store = createStore(fn);
```

Store 允许使用 store.subscribe 方法设置监听函数，一旦 State 发生变化，就自动执行这个函数。这样不管 View 是用什么实现的，只要把 View 的更新函数 subscribe 一下，就可以实现 State 变化之后，View 自动渲染了。比如在 React 里，把组件的 render 方法或 setState 方法订阅进去就行。

- Action

和 Flux 一样，Redux 里面也有 Action，Action 就是 View 发出的通知，告诉 Store State 要改变。Action 必须有一个 type 属性，代表 Action 的名称，其他可以设置一堆属性，作为参数供 State 变更时参考。

```js
const action = {
  type: "ADD_TODO",
  payload: "Learn Redux",
};
```

Redux 可以用 Action Creator 批量来生成一些 Action。

- Reducer

Redux 没有 Dispatcher 的概念，Store 里面已经集成了 dispatch 方法。store.dispatch()是 View 发出 Action 的唯一方法。

```js
import { createStore } from "redux";
const store = createStore(fn);
store.dispatch({
  type: "ADD_TODO",
  payload: "Learn Redux",
});
```

Redux 用一个叫做 Reducer 的纯函数来处理事件。Store 收到 Action 以后，必须给出一个新的 State（就是刚才说的 Store 的 State 不能直接修改，每次只能返回一个新的 State），这样 View 才会发生变化。这种 State 的计算过程就叫做 Reducer。

什么是纯函数呢，就是说没有任何的副作用，比如这样一个函数：

```js
function getAge(user) {
  user.age = user.age + 1;
  return user.age;
}
```

这个函数就有副作用，每一次相同的输入，都可能导致不同的输出，而且还会影响输入 user 的值，再比如：

```js
let b = 10;
function compare(a) {
  return a >= b;
}
```

这个函数也有副作用，就是依赖外部的环境，b 在别处被改变了，返回值对于相同的 a 就有可能不一样。

而 Reducer 是一个纯函数，对于相同的输入，永远都只会有相同的输出，不会影响外部的变量，也不会被外部变量影响，不得改写参数。它的作用大概就是这样，根据应用的状态和当前的 action 推导出新的 state：

```js
(previousState, action) => newState;
```

类比 Flux，Flux 有些像：

```js
(state, action) => state;
```

为什么叫做 Reducer 呢？reduce 是一个函数式编程的概念，经常和 map 放在一起说，简单来说，map 就是映射，reduce 就是归纳。映射就是把一个列表按照一定规则映射成另一个列表，而 reduce 是把一个列表通过一定规则进行合并，也可以理解为对初始值进行一系列的操作，返回一个新的值。

比如 Array 就有一个方法叫 reduce，Array.prototype.reduce(reducer, ?initialValue)，把 Array 整吧整吧弄成一个 newValue。

```js
const array1 = [1, 2, 3, 4];
const reducer = (accumulator, currentValue) => accumulator + currentValue; // 1 + 2 + 3 + 4
console.log(array1.reduce(reducer)); // expected output: 10// 5 + 1 + 2 + 3 + 4
console.log(array1.reduce(reducer, 5)); // expected output: 15
```

看起来和 Redux 的 Reducer 是不是好像好像，Redux 的 Reducer 就是 reduce 一个列表（action 的列表）和一个 initialValue（初始的 State）到一个新的 value（新的 State）。

把上面的概念连起来，举个例子：

下面的代码声明了 reducer：

```js
const defaultState = 0;
const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case "ADD":
      return state + action.payload;
    default:
      return state;
  }
};
```

createStore 接受 Reducer 作为参数，生成一个新的 Store。以后每当 store.dispatch 发送过来一个新的 Action，就会自动调用 Reducer，得到新的 State。

```js
import { createStore } from "redux";
const store = createStore(reducer);
```

createStore 内部干了什么事儿呢？通过一个简单的 createStore 的实现，可以了解大概的原理（可以略过不看）：

##### Middleware

- redux-thunk

- redux-promise

#### Recoil

#### React-redux

Redux 和 Flux 类似，只是一种思想或者规范，它和 React 之间没有关系。Redux 支持 React、Angular、Ember、jQuery 甚至纯 JavaScript。

但是因为 React 包含函数式的思想，也是单向数据流，和 Redux 很搭，所以一般都用 Redux 来进行状态管理。为了简单处理 Redux 和 React UI 的绑定，一般通过一个叫 react-redux 的库和 React 配合使用，这个是 react 官方出的（如果不用 react-redux，那么手动处理 Redux 和 UI 的绑定，需要写很多重复的代码，很容易出错，而且有很多 UI 渲染逻辑的优化不一定能处理好）。

Redux 将 React 组件分为容器型组件和展示型组件，容器型组件一般通过 connect 函数生成，它订阅了全局状态的变化，通过 mapStateToProps 函数，可以对全局状态进行过滤，而展示型组件不直接从 global state 获取数据，其数据来源于父组件。
![React-redux](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevjjwdTCqASehPykQpZFvJr3O1fIrPiaB1uBTWSqhSdqXAMnFtZJv4DMgFEqibA7j57wTDSg6YxQicREg/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

如果一个组件既需要 UI 呈现，又需要业务逻辑处理，那就得拆，拆成一个容器组件包着一个展示组件。

因为 react-redux 只是 redux 和 react 结合的一种实现，除了刚才说的组件拆分，并没有什么新奇的东西，所以只拿一个简单 TODO 项目的部分代码来举例：

入口文件 index.js，把 redux 的相关 store、reducer 通过 Provider 注册到 App 里面，这样子组件就可以拿到 store 了。

```js
import React from 'react'import { render } from 'react-dom'import { Provider } from 'react-redux'import { createStore } from 'redux'import rootReducer from './reducers'import App from './components/App'const store = createStore(rootReducer)
render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'))
```

actions/index.js，创建 Action：

```js
let nextTodoId = 0export const addTodo = text => ({
  type: 'ADD_TODO',
  id: nextTodoId++,
  text})export const setVisibilityFilter = filter => ({
  type: 'SET_VISIBILITY_FILTER',
  filter})export const toggleTodo = id => ({
  type: 'TOGGLE_TODO',
  id})export const VisibilityFilters = {
  SHOW_ALL: 'SHOW_ALL',
  SHOW_COMPLETED: 'SHOW_COMPLETED',
  SHOW_ACTIVE: 'SHOW_ACTIVE'}
```

reducers/todos.js，创建 Reducers：

```js
const todos = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        {
          id: action.id,
          text: action.text,
          completed: false
        }
      ]
    case 'TOGGLE_TODO':
      return state.map(todo =>
        todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
      )
    default:
      return state
  }}export default todos
```

reducers/index.js，把所有的 Reducers 绑定到一起：

```js
import { combineReducers } from 'redux'import todos from './todos'import visibilityFilter from './visibilityFilter'export default combineReducers({
  todos,
  visibilityFilter,
  ...})
```

containers/VisibleTodoList.js，容器组件，connect 负责连接 React 组件和 Redux Store：

```js
import { connect } from 'react-redux'import { toggleTodo } from '../actions'import TodoList from '../components/TodoList'const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'SHOW_COMPLETED':
      return todos.filter(t => t.completed)
    case 'SHOW_ACTIVE':
      return todos.filter(t => !t.completed)
    case 'SHOW_ALL':
    default:
      return todos
  }}// mapStateToProps 函数指定如何把当前 Redux store state 映射到展示组件的 props 中const mapStateToProps = state => ({
  todos: getVisibleTodos(state.todos, state.visibilityFilter)})// mapDispatchToProps 方法接收 dispatch() 方法并返回期望注入到展示组件的 props 中的回调方法。const mapDispatchToProps = dispatch => ({
  toggleTodo: id => dispatch(toggleTodo(id))})export default connect(
  mapStateToProps,
  mapDispatchToProps)(TodoList)

```

简单来说，react-redux 就是多了个 connect 方法连接容器组件和 UI 组件，这里的“连接”就是一种映射：mapStateToProps 把容器组件的 state 映射到 UI 组件的 props mapDispatchToProps 把 UI 组件的事件映射到 dispatch 方法

#### Redux-saga

刚才介绍了两个 Redux 处理异步的中间件 redux-thunk 和 redux-promise，当然 redux 的异步中间件还有很多，他们可以处理大部分场景，这些中间件的思想基本上都是把异步请求部分放在了 action creator 中，理解起来比较简单。

redux-saga 采用了另外一种思路，它没有把异步操作放在 action creator 中，也没有去处理 reductor，而是把所有的异步操作看成“线程”，可以通过普通的 action 去触发它，当操作完成时也会触发 action 作为输出。saga 的意思本来就是一连串的事件。

redux-saga 把异步获取数据这类的操作都叫做副作用（Side Effect），它的目标就是把这些副作用管理好，让他们执行更高效，测试更简单，在处理故障时更容易。

在聊 redux-saga 之前，需要熟悉一些预备知识，那就是 ES6 的 Generator。

如果从没接触过 Generator 的话，看着下面的代码，给你个 1 分钟傻瓜式速成，函数加个星号就是 Generator 函数了，Generator 就是个骂街生成器，Generator 函数里可以写一堆 yield 关键字，可以记成“丫的”，Generator 函数执行的时候，啥都不干，就等着调用 next 方法，按照顺序把标记为“丫的”的地方一个一个拎出来骂（遍历执行），骂到最后没有“丫的”标记了，就返回最后的 return 值，然后标记为 done: true，也就是骂完了（上面只是帮助初学者记忆，别喷~）。

```js
function* helloWorldGenerator() {
  yield "hello";
  yield "world";
  return "ending";
}
var hw = helloWorldGenerator();
hw.next(); // 先把 'hello' 拎出来，done: false 代表还没骂完// { value: 'hello', done: false } next() 方法有固定的格式，value 是返回值，done 代表是否遍历结束
hw.next(); // 再把 'world' 拎出来，done: false 代表还没骂完// { value: 'world', done: false }
hw.next(); // 没有 yield 了，就把最后的 return 'ending' 拎出来，done: true 代表骂完了// { value: 'ending', done: true }
hw.next(); // 没有 yield，也没有 return 了，真的骂完了，只能挤出来一个 undefined 了，done: true 代表骂完了// { value: undefined, done: true }
```

这样搞有啥好处呢？我们发现 Generator 函数的很多代码可以被延缓执行，也就是具备了暂停和记忆的功能：遇到 yield 表达式，就暂停执行后面的操作，并将紧跟在 yield 后面的那个表达式的值，作为返回的对象的 value 属性值，等着下一次调用 next 方法时，再继续往下执行。用 Generator 来写异步代码，大概长这样：

```js
function* gen() {
  var url = "https://api.github.com/users/github";
  var jsonData = yield fetch(url);
  console.log(jsonData);
}
var g = gen();
var result = g.next();
// 这里的result是 { value: fetch('https://api.github.com/users/github'), done: true }// fetch(url) 是一个 Promise，所以需要 then 来执行下一步
result.value
  .then(function (data) {
    return data.json();
  })
  .then(function (data) {
    // 获取到 json data，然后作为参数调用 next，相当于把 data 传给了 jsonData，然后执行 console.log(jsonData);
    g.next(data);
  });
```

再回到 redux-saga 来，可以把 saga 想象成开了一个以最快速度不断地调用 next 方法并尝试获取所有 yield 表达式值的线程。举个例子：

```js
// saga.jsimport { take, put } from 'redux-saga/effects'function* mySaga(){
    // 阻塞: take方法就是等待 USER_INTERACTED_WITH_UI_ACTION 这个 action 执行
    yield take(USER_INTERACTED_WITH_UI_ACTION);
    // 阻塞: put方法将同步发起一个 action
    yield put(SHOW_LOADING_ACTION, {isLoading: true});
    // 阻塞: 将等待 FetchFn 结束，等待返回的 Promise
    const data = yield call(FetchFn, 'https://my.server.com/getdata');
    // 阻塞: 将同步发起 action (使用刚才返回的 Promise.then)
    yield put(SHOW_DATA_ACTION, {data: data});}
```

这里用了好几个 yield，简单理解，也就是每个 yield 都发起了阻塞，saga 会等待执行结果返回，再执行下一指令。也就是相当于 take、put、call、put 这几个方法的调用变成了同步的，上面的全部完成返回了，才会执行下面的，类似于 await。
用了 saga，我们就可以很细粒度的控制各个副作用每一部的操作，可以把异步操作和同步发起 action 一起，随便的排列组合。saga 还提供 takeEvery、takeLatest 之类的辅助函数，来控制是否允许多个异步请求同时执行，尤其是 takeLatest，方便处理由于网络延迟造成的多次请求数据冲突或混乱的问题。
saga 看起来很复杂，主要原因可能是因为大家不熟悉 Generator 的语法，还有需要学习一堆新增的 API 。如果抛开这些记忆的东西，改造一下，再来看一下代码：

```js
function mySaga() {
  if (action.type === "USER_INTERACTED_WITH_UI_ACTION") {
    store.dispatch({ type: "SHOW_LOADING_ACTION", isLoading: true });
    const data = await Fetch("https://my.server.com/getdata");
    store.dispatch({ type: "SHOW_DATA_ACTION", data: data });
  }
}
```

上面的代码就很清晰了吧，全部都是同步的写法，无比顺畅，当然直接这样写是不支持的，所以那些 Generator 语法和 API，无非就是做一些适配而已。
saga 还能很方便的并行执行异步任务，或者让两个异步任务竞争：

```js
// 并行执行，并等待所有的结果，类似 Promise.all 的行为const [users, repos] = yield [
  call(fetch, '/users'),
  call(fetch, '/repos')]// 并行执行，哪个先完成返回哪个，剩下的就取消掉了const {posts, timeout} = yield race({
  posts: call(fetchApi, '/posts'),
  timeout: call(delay, 1000)})
```

saga 的每一步都可以做一些断言（assert）之类的，所以非常方便测试。而且很容易测试到不同的分支。

这里不讨论更多 saga 的细节，大家了解 saga 的思想就行，细节请看文档。

对比 Redux-thunk

![对比 Redux-thunk](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevjjwdTCqASehPykQpZFvJr3jwVOvuXyZVRbf4I6YIgy5OISpIosDeGjicpjg9zJ5ibxaoLKvduerOYA/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

比较一下 redux-thunk 和 redux-saga 的代码：
![redux-thunk 和 redux-saga 的代码](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevjjwdTCqASehPykQpZFvJr3eAd065osu6XXghtoiagN8jQbJxkHt2fRTNj8XFFpBcSuZLHIH0qIyFg/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

![](https://mmbiz.qpic.cn/mmbiz_jpg/meG6Vo0MevjjwdTCqASehPykQpZFvJr3OG87iaHDogYm7XjicZVlpUmpIlQCeJJTzu5rL34IV0evRp7OUCMYQibYg/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

和 redux-thunk 等其他异步中间件对比来说，redux-saga 主要有下面几个特点：异步数据获取的相关业务逻辑放在了单独的 saga.js 中，不再是掺杂在 action.js 或 component.js 中。dispatch 的参数是标准的 action，没有魔法。saga 代码采用类似同步的方式书写，代码变得更易读。代码异常/请求失败 都可以直接通过 try/catch 语法直接捕获处理。\* 很容易测试，如果是 thunk 的 Promise，测试的话就需要不停的 mock 不同的数据。

其实 redux-saga 是用一些学习的复杂度，换来了代码的高可维护性，还是很值得在项目中使用的。

#### 参考

[状态管理的概念，都是纸老虎](https://mp.weixin.qq.com/s/ksLn1AJhilGnnuUa3fbHqg)
[使用过 redux 和 mobx 后，总结出详细的优劣势](https://mp.weixin.qq.com/s/LQBtBb2Dth8z2-ePgh1i_A)
