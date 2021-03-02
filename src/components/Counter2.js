import React from "react";
import { useSelector, useDispatch } from "../react-redux";
const Counter2 = (props) => {
  const counter2 = useSelector((state) => state.counter2);
  const dispatch = useDispatch();
  return (
    <div>
      <p>{counter2.number}</p>
      <button onClick={() => dispatch({ type: "ADD2" })}>+</button>
      <button onClick={() => dispatch({ type: "MINUS2" })}>-</button>
    </div>
  );
};
export default Counter2;
