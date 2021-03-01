## 安装启动

```
yarn
yarn start
```

## 设计原则和思想

- 单一数据源，让 React 的组件之间的通信更加方便，同时也便于状态的统一管理
- 单向数据流，保证的数据的纯净，不被其他操作污染。
- Redux 是将整个应用状态存储到到一个地方，称为 store,里面保存一棵状态树 state
- 组件派发 action 给 store 里的 reducer, reducer 计算并返回新的 state, store 更新 state，并通知订阅它的组件进行重新渲染
- 其它组件可以通过订阅 store 中的状态(state)来刷新自己的视图

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ac17f11e346841c4a11e9a4f5b42390e~tplv-k3u1fbpfcp-watermark.image)

## 首先用`react-cli`脚手架来创建一个项目

- 删掉没用的文件
- 安装`redux`

```
npx create-react-app redux-hand
yarn add redux
```

## 先用原生的`redux`实现一个简单的计数器

- 创建`reducer`和`store`
- 创建`App`组件，在组件挂载时订阅 sotre，组件销毁前取消订阅
- 点击`+`/`-` 按钮时`dispatch`一个 action（包含`type`和`payload`两个属性），修改 store 里面的状态
- store 里面的状态更新完，执行`subscribe`函数，更新组件状态

```jsx
import React from "react";
import ReactDom from "react-dom";
import { createStore } from "redux";

// 派发动作
const INCREMENT = "INCREMENT";
const DECREMENT = "DECREMENT";

// 初始状态
let initState = { number: 0 };

const reducer = (state = initState, action) => {
  switch (action.type) {
    case INCREMENT:
      return { number: state.number + 1 };
    case DECREMENT:
      return { number: state.number - 1 };
    default:
      return state;
  }
};

// 根据reducer创建store
let store = createStore(reducer);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { number: 0 };
  }

  componentDidMount() {
    // 组件挂载时订阅sotre
    this.unsubscribe = store.subscribe(() =>
      this.setState({ number: store.getState().number })
    );
  }
  componentWillUnmount() {
    // 组件销毁前取消订阅
    this.unsubscribe();
  }

  render() {
    return (
      <div style={{ margin: "30px" }}>
        <h2>{this.state.number}</h2>
        <button title="加" onClick={() => store.dispatch({ type: INCREMENT })}>
          ＋
        </button>
        <button title="减" onClick={() => store.dispatch({ type: DECREMENT })}>
          －
        </button>
      </div>
    );
  }
}

ReactDom.render(<App />, document.getElementById("root"));
```

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/24eea55c24674e6e8ba7fcd51234e605~tplv-k3u1fbpfcp-watermark.image)

## 实现 Redux 中的核心方法

### 1、实现`createStore`

- `createStore`用来创建`store`对象，给外部使用，一般来说一个应用中只有一个`store`
- `createStore`方法返回一个对象，包含三个方法
- `getState` 获取 store 里的状态，直接将 store 里的状态返回即可
- `subscribe`订阅，会将订阅的函数保存在`currentListeners`中，然后返回`unsubscribe`函数取消订阅（就是将订阅的函数从`currentListeners`中删除）。
- `dispatch`派发 action，会先执行`reducer`函数，获取最新状态，然后从依次执行`currentListeners`中订阅的函数。

```js
import ActionTypes from "./utils/actionTypes";

export default function createStore(reducer, preloadedState) {
  let currentReducer = reducer;
  let currentState = preloadedState;
  let currentListeners = [];
  function getState() {
    return currentState;
  }

  function subscribe(listener) {
    currentListeners.push(listener);

    return function unsubscribe() {
      const index = currentListeners.indexOf(listener);
      currentListeners.splice(index, 1);
    };
  }

  function dispatch(action) {
    currentState = currentReducer(currentState, action);
    for (let i = 0; i < currentListeners.length; i++) {
      const listener = currentListeners[i];
      listener();
    }
    return action;
  }

  dispatch({ type: ActionTypes.INIT });

  const store = {
    dispatch,
    subscribe,
    getState,
  };
  return store;
}
```

> 上面派发的 action 是个普通对象，如果我们想派发一个函数，或者做异步处理改怎么办

### 2、接下来我们看一下 bindActionCreators 的用法

- 声明 `add`和`minus` 两个函数，返回值是`action`对象
- 调用`bindActionCreators`方法将 `actions`和`store.dispatch`方法进行绑定

```js
function add() {
  return { type: INCREMENT };
}
function minus() {
  return { type: DECREMENT };
}
const actions = { add, minus };
const boundActions = bindActionCreators(actions, store.dispatch);
```

- 在 render 函数中使用`boundActions`

```jsx
render() {
    return (
      <div style={{ margin: "30px" }}>
        <h2>{store.getState().number}</h2>
        <button title="加" onClick={() => store.dispatch({ type: INCREMENT })}>
          ＋
        </button>
        <button title="减" onClick={() => store.dispatch({ type: DECREMENT })}>
          －
        </button>
        <button
          title="异步加一"
          onClick={() => setTimeout(boundActions.add, 1000)}
        >
          异步＋
        </button>
      </div>
    );
  }
```

### 3、实现`bindActionCreator`

- 本质上是将传入的函数用`dispatch`方法进行了一次包装，返回了一个新的函数
- 在绑定后的函数中可以直接拿到`dispatch`方法进行调用，修改 store 里的状态

```js
function bindActionCreator(actionCreator, dispatch) {
  return function (...args) {
    return dispatch(actionCreator.apply(this, args));
  };
}

export default function bindActionCreators(actionCreators, dispatch) {
  // 传入的是单个函数，直接绑定并返回
  if (typeof actionCreators === "function") {
    return bindActionCreator(actionCreators, dispatch);
  }
  const boundActionCreators = {};
  for (const key in actionCreators) {
    const actionCreator = actionCreators[key];
    if (typeof actionCreator === "function") {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }
  return boundActionCreators;
}
```

### 4、store 中只能有一个`reducer`和`state`，当我们有多个模块有多个 reducer 时，需要用`combineReducers`对`reducer`进行合并，我们先看一下怎么使用

- 对原有项目按`redux`在项目中的真实使用进行改造，最终目录如下

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cf14926bd5bb4309a1bfb127c486f1cf~tplv-k3u1fbpfcp-watermark.image)

- counter1 的 reducer，counter2 类似

```js
import * as types from "../action-types";
let initialState = { number: 0 };
export default function (state = initialState, action) {
  switch (action.type) {
    case types.ADD1:
      return { number: state.number + 1 };
    case types.MINUS1:
      return { number: state.number - 1 };
    default:
      return state;
  }
}
```

- 合并 counter1、counter2 的`reducer`

```js
// src/store/reducers/index.js
import { combineReducers } from "redux";
import counter1 from "./counter1";
import counter2 from "./counter2";
let rootReducer = combineReducers({
  counter1,
  counter2,
});
export default rootReducer;
```

- 根据合并后的`reducer`创建 store

```js
import { createStore } from "../redux";
import reducer from "./reducers";
const store = createStore(reducer);
export default store;
```

### 5、实现`combineReducers`

- `combineReducers`是一个高阶函数，实质上是给`store`生成一个合并后的`总state`
- `nextState`会将每个`reducer`的 key 做为 key, 将每个`reducer`返回的`分state`作为 value 存入`nextState`进行合并，作为返回给`store`的最终状态
- 当`dispatch` 一个`action`时，会首先交给`combination`函数进行处理，`combination`中会将 `action`传给所有的`reducer`，返回最新的`分state`，放在`nextState`返回给`store`

```js
function combineReducers(reducers) {
  return function combination(state = {}, action) {
    let nextState = {};
    for (let key in reducers) {
      nextState[key] = reducers[key](state[key], action);
    }
    return nextState;
  };
}
export default combineReducers;
```

### 将项目中用到的`redux`切换到自己实现的`redux`，最终效果是一样的

> 如果这篇文章对你有帮助，请帮我点个赞吧
