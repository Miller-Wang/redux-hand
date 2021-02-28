import React from "react";
import ReactDom from "react-dom";
import { createStore } from "redux";
// import { createStore } from "./redux";

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
    // 订阅
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
      <div>
        <p>{store.getState().number}</p>
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
