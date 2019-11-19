---
title: vuex解析
---

## Vuex

我们在使用 Vue.js 开发复杂的应用时，经常会遇到多个组件共享同一个状态，亦或是多个组件会去更新同一个状态，在应用代码量较少的时候，我们可以组件间通信去维护修改数据，或者是通过事件总线来进行数据的传递以及修改。但是当应用逐渐庞大以后，代码就会变得难以维护，从父组件开始通过 prop 传递多层嵌套的数据由于层级过深而显得异常脆弱，而事件总线也会因为组件的增多、代码量的增大而显得交互错综复杂，难以捋清其中的传递关系。

那么为什么我们不能将数据层与组件层抽离开来呢？把数据层放到全局形成一个单一的 Store，组件层变得更薄，专门用来进行数据的展示及操作。所有数据的变更都需要经过全局的 Store 来进行，形成一个单向数据流，使数据变化变得“可预测”。

Vuex 是一个专门为 Vue.js 框架设计的、用于对 Vue.js 应用程序进行状态管理的库，它借鉴了 Flux、redux 的基本思想，将共享的数据抽离到全局，以一个单例存放，同时利用 Vue.js 的响应式机制来进行高效的状态管理与更新。正是因为 Vuex 使用了 Vue.js 内部的“响应式机制”，所以 Vuex 是一个专门为 Vue.js 设计并与之高度契合的框架（优点是更加简洁高效，缺点是只能跟 Vue.js 搭配使用）。具体使用方法及 API 可以参考[Vuex 的官网](https://vuex.vuejs.org/zh-cn/intro.html)。

先来看一下这张 Vuex 的数据流程图，熟悉 Vuex 使用的同学应该已经有所了解。

![](https://vuex.vuejs.org/vuex.png)

Vuex 实现了一个单向数据流，在全局拥有一个 State 存放数据，所有修改 State 的操作必须通过 Mutation 进行，Mutation 的同时提供了订阅者模式供外部插件调用获取 State 数据的更新。所有异步接口需要走 Action，常见于调用后端接口异步获取更新数据，而 Action 也是无法直接修改 State 的，还是需要通过 Mutation 来修改 State 的数据。最后，根据 State 的变化，渲染到视图上。Vuex 运行依赖 Vue 内部数据双向绑定机制，需要 new 一个 Vue 对象来实现“响应式化”，所以 Vuex 是一个专门为 Vue.js 设计的状态管理库。

## 安装

使用过 Vuex 的朋友一定知道，Vuex 的安装十分简单，只需要提供一个 store，然后执行下面两句代码即完成的 Vuex 的引入。

```javascript
Vue.use(Vuex);

/*将store放入Vue创建时的option中*/
new Vue({
  el: "#app",
  store
});
```

那么问题来了，Vuex 是怎样把 store 注入到 Vue 实例中去的呢？

Vue.js 提供了[Vue.use](https://cn.vuejs.org/v2/api/#Vue-use)方法用来给 Vue.js 安装插件，内部通过调用插件的 install 方法(当插件是一个对象的时候)来进行插件的安装。

我们来看一下 Vuex 的 install 实现。

```javascript
/*暴露给外部的插件install方法，供Vue.use调用安装插件*/
export function install(_Vue) {
  if (Vue) {
    /*避免重复安装（Vue.use内部也会检测一次是否重复安装同一个插件）*/
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "[vuex] already installed. Vue.use(Vuex) should be called only once."
      );
    }
    return;
  }
  /*保存Vue，同时用于检测是否重复安装*/
  Vue = _Vue;
  /*将vuexInit混淆进Vue的beforeCreate(Vue2.0)或_init方法(Vue1.0)*/
  applyMixin(Vue);
}
```

这段 install 代码做了两件事情，一件是防止 Vuex 被重复安装，另一件是执行 applyMixin，目的是执行 vuexInit 方法初始化 Vuex。Vuex 针对 Vue1.0 与 2.0 分别进行了不同的处理，如果是 Vue1.0，Vuex 会将 vuexInit 方法放入 Vue 的\_init 方法中，而对于 Vue2.0，则会将 vuexinit 混淆进 Vue 的 beforeCreate 钩子中。来看一下 vuexInit 的代码。

```javascript
/*Vuex的init钩子，会存入每一个Vue实例等钩子列表*/
function vuexInit() {
  const options = this.$options;
  // store injection
  if (options.store) {
    /*存在store其实代表的就是Root节点，直接执行store（function时）或者使用store（非function）*/
    this.$store =
      typeof options.store === "function" ? options.store() : options.store;
  } else if (options.parent && options.parent.$store) {
    /*子组件直接从父组件中获取$store，这样就保证了所有组件都公用了全局的同一份store*/
    this.$store = options.parent.$store;
  }
}
```

vuexInit 会尝试从 options 中获取 store，如果当前组件是根组件（Root 节点），则 options 中会存在 store，直接获取赋值给$store即可。如果当前组件非根组件，则通过options中的parent获取父组件的$store 引用。这样一来，所有的组件都获取到了同一份内存地址的 Store 实例，于是我们可以在每一个组件中通过 this.\$store 愉快地访问全局的 Store 实例了。

那么，什么是 Store 实例？

## Store

我们传入到根组件的 store，就是 Store 实例，用 Vuex 提供的 Store 方法构造。

```javascript
export default new Vuex.Store({
  strict: true,
  modules: {
    moduleA,
    moduleB
  }
});
```

我们来看一下 Store 的实现。首先是构造函数。

```javascript
constructor (options = {}) {
    // Auto install if it is not done yet and `window` has `Vue`.
    // To allow users to avoid auto-installation in some cases,
    // this code should be placed here. See #731
    /*
      在浏览器环境下，如果插件还未安装（!Vue即判断是否未安装），则它会自动安装。
      它允许用户在某些情况下避免自动安装。
    */
    if (!Vue && typeof window !== 'undefined' && window.Vue) {
      install(window.Vue)
    }

    if (process.env.NODE_ENV !== 'production') {
      assert(Vue, `must call Vue.use(Vuex) before creating a store instance.`)
      assert(typeof Promise !== 'undefined', `vuex requires a Promise polyfill in this browser.`)
      assert(this instanceof Store, `Store must be called with the new operator.`)
    }

    const {
      /*一个数组，包含应用在 store 上的插件方法。这些插件直接接收 store 作为唯一参数，可以监听 mutation（用于外部地数据持久化、记录或调试）或者提交 mutation （用于内部数据，例如 websocket 或 某些观察者）*/
      plugins = [],
      /*使 Vuex store 进入严格模式，在严格模式下，任何 mutation 处理函数以外修改 Vuex state 都会抛出错误。*/
      strict = false
    } = options

    /*从option中取出state，如果state是function则执行，最终得到一个对象*/
    let {
      state = {}
    } = options
    if (typeof state === 'function') {
      state = state()
    }

    // store internal state
    /* 用来判断严格模式下是否是用mutation修改state的 */
    this._committing = false
    /* 存放action */
    this._actions = Object.create(null)
    /* 存放mutation */
    this._mutations = Object.create(null)
    /* 存放getter */
    this._wrappedGetters = Object.create(null)
    /* module收集器 */
    this._modules = new ModuleCollection(options)
    /* 根据namespace存放module */
    this._modulesNamespaceMap = Object.create(null)
    /* 存放订阅者 */
    this._subscribers = []
    /* 用以实现Watch的Vue实例 */
    this._watcherVM = new Vue()

    // bind commit and dispatch to self
    /*将dispatch与commit调用的this绑定为store对象本身，否则在组件内部this.dispatch时的this会指向组件的vm*/
    const store = this
    const { dispatch, commit } = this
    /* 为dispatch与commit绑定this（Store实例本身） */
    this.dispatch = function boundDispatch (type, payload) {
      return dispatch.call(store, type, payload)
    }
    this.commit = function boundCommit (type, payload, options) {
      return commit.call(store, type, payload, options)
    }

    // strict mode
    /*严格模式(使 Vuex store 进入严格模式，在严格模式下，任何 mutation 处理函数以外修改 Vuex state 都会抛出错误)*/
    this.strict = strict

    // init root module.
    // this also recursively registers all sub-modules
    // and collects all module getters inside this._wrappedGetters
    /*初始化根module，这也同时递归注册了所有子module，收集所有module的getter到_wrappedGetters中去，this._modules.root代表根module才独有保存的Module对象*/
    installModule(this, state, [], this._modules.root)

    // initialize the store vm, which is responsible for the reactivity
    // (also registers _wrappedGetters as computed properties)
    /* 通过vm重设store，新建Vue对象使用Vue内部的响应式实现注册state以及computed */
    resetStoreVM(this, state)

    // apply plugins
    /* 调用插件 */
    plugins.forEach(plugin => plugin(this))

    /* devtool插件 */
    if (Vue.config.devtools) {
      devtoolPlugin(this)
    }
  }
```

Store 的构造类除了初始化一些内部变量以外，主要执行了 installModule（初始化 module）以及 resetStoreVM（通过 VM 使 store“响应式”）。

### installModule

installModule 的作用主要是为 module 加上 namespace 名字空间（如果有）后，注册 mutation、action 以及 getter，同时递归安装所有子 module。

```javascript
/*初始化module*/
function installModule (store, rootState, path, module, hot) {
  /* 是否是根module */
  const isRoot = !path.length
  /* 获取module的namespace */
  const namespace = store._modules.getNamespace(path)

  // register in namespace map
  /* 如果有namespace则在_modulesNamespaceMap中注册 */
  if (module.namespaced) {
    store._modulesNamespaceMap[namespace] = module
  }

  // set state
  if (!isRoot && !hot) {
    /* 获取父级的state */
    const parentState = getNestedState(rootState, path.slice(0, -1))
    /* module的name */
    const moduleName = path[path.length - 1]
    store.`_withCommit`(() => {
      /* 将子module设成响应式的 */
      Vue.set(parentState, moduleName, module.state)
    })
  }

  const local = module.context = makeLocalContext(store, namespace, path)

  /* 遍历注册mutation */
  module.forEachMutation((mutation, key) => {
    const namespacedType = namespace + key
    registerMutation(store, namespacedType, mutation, local)
  })

  /* 遍历注册action */
  module.forEachAction((action, key) => {
    const namespacedType = namespace + key
    registerAction(store, namespacedType, action, local)
  })

  /* 遍历注册getter */
  module.forEachGetter((getter, key) => {
    const namespacedType = namespace + key
    registerGetter(store, namespacedType, getter, local)
  })

  /* 递归安装mudule */
  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child, hot)
  })
}
```

### resetStoreVM

在说 resetStoreVM 之前，先来看一个小 demo。

```javascript
let globalData = {
    d: 'hello world'
};
new Vue({
    data () {
        return {
            $$state: {
                globalData
            }
        }
    }
});

/* modify */
setTimeout(() => {
    globalData.d = 'hi~';
}, 1000);

Vue.prototype.globalData = globalData;

/* 任意模板中 */
<div>{{globalData.d}}</div>
```

上述代码在全局有一个 globalData，它被传入一个 Vue 对象的 data 中，之后在任意 Vue 模板中对该变量进行展示，因为此时 globalData 已经在 Vue 的 prototype 上了所以直接通过 this.prototype 访问，也就是在模板中的{{prototype.d}}。此时，setTimeout 在 1s 之后将 globalData.d 进行修改，我们发现模板中的 globalData.d 发生了变化。其实上述部分就是 Vuex 依赖 Vue 核心实现数据的“响应式化”。

不熟悉 Vue.js 响应式原理的同学可以通过笔者另一篇文章[响应式原理](https://github.com/answershuto/learnVue/blob/master/docs/%E5%93%8D%E5%BA%94%E5%BC%8F%E5%8E%9F%E7%90%86.MarkDown)了解 Vue.js 是如何进行数据双向绑定的。

接着来看代码。

```javascript
/* 通过vm重设store，新建Vue对象使用Vue内部的响应式实现注册state以及computed */
function resetStoreVM(store, state, hot) {
  /* 存放之前的vm对象 */
  const oldVm = store._vm;

  // bind store public getters
  store.getters = {};
  const wrappedGetters = store._wrappedGetters;
  const computed = {};

  /* 通过Object.defineProperty为每一个getter方法设置get方法，比如获取this.$store.getters.test的时候获取的是store._vm.test，也就是Vue对象的computed属性 */
  forEachValue(wrappedGetters, (fn, key) => {
    // use computed to leverage its lazy-caching mechanism
    computed[key] = () => fn(store);
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true // for local getters
    });
  });

  // use a Vue instance to store the state tree
  // suppress warnings just in case the user has added
  // some funky global mixins
  const silent = Vue.config.silent;
  /* Vue.config.silent暂时设置为true的目的是在new一个Vue实例的过程中不会报出一切警告 */
  Vue.config.silent = true;
  /*  这里new了一个Vue对象，运用Vue内部的响应式实现注册state以及computed*/
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  });
  Vue.config.silent = silent;

  // enable strict mode for new vm
  /* 使能严格模式，保证修改store只能通过mutation */
  if (store.strict) {
    enableStrictMode(store);
  }

  if (oldVm) {
    /* 解除旧vm的state的引用，以及销毁旧的Vue对象 */
    if (hot) {
      // dispatch changes in all subscribed watchers
      // to force getter re-evaluation for hot reloading.
      store._withCommit(() => {
        oldVm._data.$$state = null;
      });
    }
    Vue.nextTick(() => oldVm.$destroy());
  }
}
```

resetStoreVM 首先会遍历 wrappedGetters，使用 Object.defineProperty 方法为每一个 getter 绑定上 get 方法，这样我们就可以在组件里访问 this.\$store.getters.test 就等同于访问 store.\_vm.test。

```javascript
forEachValue(wrappedGetters, (fn, key) => {
  // use computed to leverage its lazy-caching mechanism
  computed[key] = () => fn(store);
  Object.defineProperty(store.getters, key, {
    get: () => store._vm[key],
    enumerable: true // for local getters
  });
});
```

之后 Vuex 采用了 new 一个 Vue 对象来实现数据的“响应式化”，运用 Vue.js 内部提供的数据双向绑定功能来实现 store 的数据与视图的同步更新。

```javascript
store._vm = new Vue({
  data: {
    $$state: state
  },
  computed
});
```

这时候我们访问 store.\_vm.test 也就访问了 Vue 实例中的属性。

这两步执行完以后，我们就可以通过 this.\$store.getter.test 访问 vm 中的 test 属性了。

### 严格模式

Vuex 的 Store 构造类的 option 有一个 strict 的参数，可以控制 Vuex 执行严格模式，严格模式下，所有修改 state 的操作必须通过 mutation 实现，否则会抛出错误。

```javascript
/* 使能严格模式 */
function enableStrictMode(store) {
  store._vm.$watch(
    function() {
      return this._data.$$state;
    },
    () => {
      if (process.env.NODE_ENV !== "production") {
        /* 检测store中的_committing的值，如果是false代表不是通过mutation的方法修改的 */
        assert(
          store._committing,
          `Do not mutate vuex store state outside mutation handlers.`
        );
      }
    },
    { deep: true, sync: true }
  );
}
```

首先，在严格模式下，Vuex 会利用 vm 的$watch方法来观察$\$state，也就是 Store 的 state，在它被修改的时候进入回调。我们发现，回调中只有一句话，用 assert 断言来检测 store.\_committing，当 store.\_committing 为 false 的时候会触发断言，抛出异常。

我们发现，Store 的 commit 方法中，执行 mutation 的语句是这样的。

```javascript
this._withCommit(() => {
  entry.forEach(function commitIterator(handler) {
    handler(payload);
  });
});
```

再来看看\_withCommit 的实现。

```javascript
_withCommit (fn) {
  /* 调用withCommit修改state的值时会将store的committing值置为true，内部会有断言检查该值，在严格模式下只允许使用mutation来修改store中的值，而不允许直接修改store的数值 */
  const committing = this._committing
  this._committing = true
  fn()
  this._committing = committing
}
```

我们发现，通过 commit（mutation）修改 state 数据的时候，会在调用 mutation 方法之前将 committing 置为 true，接下来再通过 mutation 函数修改 state 中的数据，这时候触发$watch中的回调断言committing是不会抛出异常的（此时committing为true）。而当我们直接修改state的数据时，触发$watch 的回调执行断言，这时 committing 为 false，则会抛出异常。这就是 Vuex 的严格模式的实现。

接下来我们来看看 Store 提供的一些 API。

### commit（[mutation](https://vuex.vuejs.org/zh-cn/mutations.html)）

```javascript
/* 调用mutation的commit方法 */
commit (_type, _payload, _options) {
  // check object-style commit
  /* 校验参数 */
  const {
    type,
    payload,
    options
  } = unifyObjectStyle(_type, _payload, _options)

  const mutation = { type, payload }
  /* 取出type对应的mutation的方法 */
  const entry = this._mutations[type]
  if (!entry) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[vuex] unknown mutation type: ${type}`)
    }
    return
  }
  /* 执行mutation中的所有方法 */
  this._withCommit(() => {
    entry.forEach(function commitIterator (handler) {
      handler(payload)
    })
  })
  /* 通知所有订阅者 */
  this._subscribers.forEach(sub => sub(mutation, this.state))

  if (
    process.env.NODE_ENV !== 'production' &&
    options && options.silent
  ) {
    console.warn(
      `[vuex] mutation type: ${type}. Silent option has been removed. ` +
      'Use the filter functionality in the vue-devtools'
    )
  }
}
```

commit 方法会根据 type 找到并调用\_mutations 中的所有 type 对应的 mutation 方法，所以当没有 namespace 的时候，commit 方法会触发所有 module 中的 mutation 方法。再执行完所有的 mutation 之后会执行\_subscribers 中的所有订阅者。我们来看一下\_subscribers 是什么。

Store 给外部提供了一个 subscribe 方法，用以注册一个订阅函数，会 push 到 Store 实例的\_subscribers 中，同时返回一个从\_subscribers 中注销该订阅者的方法。

```javascript
/* 注册一个订阅函数，返回取消订阅的函数 */
subscribe (fn) {
  const subs = this._subscribers
  if (subs.indexOf(fn) < 0) {
    subs.push(fn)
  }
  return () => {
    const i = subs.indexOf(fn)
    if (i > -1) {
      subs.splice(i, 1)
    }
  }
}
```

在 commit 结束以后则会调用这些\_subscribers 中的订阅者，这个订阅者模式提供给外部一个监视 state 变化的可能。state 通过 mutation 改变时，可以有效补获这些变化。

### dispatch（[action](https://vuex.vuejs.org/zh-cn/actions.html)）

来看一下 dispatch 的实现。

```javascript
/* 调用action的dispatch方法 */
dispatch (_type, _payload) {
  // check object-style dispatch
  const {
    type,
    payload
  } = unifyObjectStyle(_type, _payload)

  /* actions中取出type对应的action */
  const entry = this._actions[type]
  if (!entry) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[vuex] unknown action type: ${type}`)
    }
    return
  }

  /* 是数组则包装Promise形成一个新的Promise，只有一个则直接返回第0个 */
  return entry.length > 1
    ? Promise.all(entry.map(handler => handler(payload)))
    : entry[0](payload)
}
```

以及 registerAction 时候做的事情。

```javascript
/* 遍历注册action */
function registerAction(store, type, handler, local) {
  /* 取出type对应的action */
  const entry = store._actions[type] || (store._actions[type] = []);
  entry.push(function wrappedActionHandler(payload, cb) {
    let res = handler.call(
      store,
      {
        dispatch: local.dispatch,
        commit: local.commit,
        getters: local.getters,
        state: local.state,
        rootGetters: store.getters,
        rootState: store.state
      },
      payload,
      cb
    );
    /* 判断是否是Promise */
    if (!isPromise(res)) {
      /* 不是Promise对象的时候转化称Promise对象 */
      res = Promise.resolve(res);
    }
    if (store._devtoolHook) {
      /* 存在devtool插件的时候触发vuex的error给devtool */
      return res.catch(err => {
        store._devtoolHook.emit("vuex:error", err);
        throw err;
      });
    } else {
      return res;
    }
  });
}
```

因为 registerAction 的时候将 push 进\_actions 的 action 进行了一层封装（wrappedActionHandler），所以我们在进行 dispatch 的第一个参数中获取 state、commit 等方法。之后，执行结果 res 会被进行判断是否是 Promise，不是则会进行一层封装，将其转化成 Promise 对象。dispatch 时则从\_actions 中取出，只有一个的时候直接返回，否则用 Promise.all 处理再返回。

### watch

```javascript
/* 观察一个getter方法 */
watch (getter, cb, options) {
  if (process.env.NODE_ENV !== 'production') {
    assert(typeof getter === 'function', `store.watch only accepts a function.`)
  }
  return this._watcherVM.$watch(() => getter(this.state, this.getters), cb, options)
}
```

熟悉 Vue 的朋友应该很熟悉 watch 这个方法。这里采用了比较巧妙的设计，\_watcherVM 是一个 Vue 的实例，所以 watch 就可以直接采用了 Vue 内部的 watch 特性提供了一种观察数据 getter 变动的方法。

### registerModule

```javascript
/* 注册一个动态module，当业务进行异步加载的时候，可以通过该接口进行注册动态module */
registerModule (path, rawModule) {
  /* 转化称Array */
  if (typeof path === 'string') path = [path]

  if (process.env.NODE_ENV !== 'production') {
    assert(Array.isArray(path), `module path must be a string or an Array.`)
    assert(path.length > 0, 'cannot register the root module by using registerModule.')
  }

  /*注册*/
  this._modules.register(path, rawModule)
  /*初始化module*/
  installModule(this, this.state, path, this._modules.get(path))
  // reset store to update getters...
  /* 通过vm重设store，新建Vue对象使用Vue内部的响应式实现注册state以及computed */
  resetStoreVM(this, this.state)
}
```

registerModule 用以注册一个动态模块，也就是在 store 创建以后再注册模块的时候用该接口。内部实现实际上也只有 installModule 与 resetStoreVM 两个步骤，前面已经讲过，这里不再累述。

### unregisterModule

```javascript
 /* 注销一个动态module */
unregisterModule (path) {
  /* 转化称Array */
  if (typeof path === 'string') path = [path]

  if (process.env.NODE_ENV !== 'production') {
    assert(Array.isArray(path), `module path must be a string or an Array.`)
  }

  /*注销*/
  this._modules.unregister(path)
  this._withCommit(() => {
    /* 获取父级的state */
    const parentState = getNestedState(this.state, path.slice(0, -1))
    /* 从父级中删除 */
    Vue.delete(parentState, path[path.length - 1])
  })
  /* 重制store */
  resetStore(this)
}
```

同样，与 registerModule 对应的方法 unregisterModule，动态注销模块。实现方法是先从 state 中删除模块，然后用 resetStore 来重制 store。

### resetStore

```javascript
/* 重制store */
function resetStore(store, hot) {
  store._actions = Object.create(null);
  store._mutations = Object.create(null);
  store._wrappedGetters = Object.create(null);
  store._modulesNamespaceMap = Object.create(null);
  const state = store.state;
  // init all modules
  installModule(store, state, [], store._modules.root, true);
  // reset vm
  resetStoreVM(store, state, hot);
}
```

这里的 resetStore 其实也就是将 store 中的\_actions 等进行初始化以后，重新执行 installModule 与 resetStoreVM 来初始化 module 以及用 Vue 特性使其“响应式化”，这跟构造函数中的是一致的。

## 插件

Vue 提供了一个非常好用的插件[Vue.js devtools](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)

```javascript
/* 从window对象的__VUE_DEVTOOLS_GLOBAL_HOOK__中获取devtool插件 */
const devtoolHook =
  typeof window !== "undefined" && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

export default function devtoolPlugin(store) {
  if (!devtoolHook) return;

  /* devtoll插件实例存储在store的_devtoolHook上 */
  store._devtoolHook = devtoolHook;

  /* 出发vuex的初始化事件，并将store的引用地址传给deltool插件，使插件获取store的实例 */
  devtoolHook.emit("vuex:init", store);

  /* 监听travel-to-state事件 */
  devtoolHook.on("vuex:travel-to-state", targetState => {
    /* 重制state */
    store.replaceState(targetState);
  });

  /* 订阅store的变化 */
  store.subscribe((mutation, state) => {
    devtoolHook.emit("vuex:mutation", mutation, state);
  });
}
```

如果已经安装了该插件，则会在 windows 对象上暴露一个**VUE_DEVTOOLS_GLOBAL_HOOK**。devtoolHook 用在初始化的时候会触发“vuex:init”事件通知插件，然后通过 on 方法监听“vuex:travel-to-state”事件来重置 state。最后通过 Store 的 subscribe 方法来添加一个订阅者，在触发 commit 方法修改 mutation 数据以后，该订阅者会被通知，从而触发“vuex:mutation”事件。
