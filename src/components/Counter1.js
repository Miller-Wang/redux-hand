import React, { Component } from "react";
import { bindActionCreators } from "../redux";
import actions from "../store/actions/counter1";
import store from "../store";
const boundActions = bindActionCreators(actions, store.dispatch);
export default class Counter extends Component {
  unsubscribe;
  constructor(props) {
    super(props);
    this.state = { number: 0 };
  }
  componentDidMount() {
    this.unsubscribe = store.subscribe(() =>
      this.setState({ number: store.getState().counter1.number })
    );
  }
  componentWillUnmount() {
    this.unsubscribe();
  }
  render() {
    return (
      <div>
        <p>{this.state.number}</p>
        <button onClick={boundActions.add1}>+</button>
        <button onClick={boundActions.minus1}>-</button>
        <button onClick={() => setTimeout(boundActions.add1, 1000)}>
          1秒后加1
        </button>
      </div>
    );
  }
}
