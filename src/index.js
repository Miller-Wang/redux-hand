import React from "react";
import ReactDom from "react-dom";
import { createStore, bindActionCreators } from "redux";

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

function add() {
  return { type: INCREMENT };
}
function minus() {
  return { type: DECREMENT };
}
const actions = { add, minus };
const boundActions = bindActionCreators(actions, store.dispatch);

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
        <h2>{store.getState().number}</h2>
        <button title="加" onClick={boundActions.add}>
          ＋
        </button>
        <button title="减" onClick={boundActions.minus}>
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
}

ReactDom.render(<App />, document.getElementById("root"));
