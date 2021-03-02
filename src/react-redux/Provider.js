import React from "react";
import ReactReduxContext from "./ReactReduxContext";

export default function (props) {
  return (
    <ReactReduxContext.Provider value={{ store: props.store }}>
      {props.children}
    </ReactReduxContext.Provider>
  );
}
