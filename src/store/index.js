import { createStore } from "../redux";
import reducer from "./reducers";
const store = createStore(reducer, {
  counter1: { number: 0 },
  counter2: { number: 0 },
});
export default store;
