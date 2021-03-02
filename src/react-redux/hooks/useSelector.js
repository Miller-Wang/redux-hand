import { useContext, useLayoutEffect, useReducer } from "react";
import ReactReduxContext from "../ReactReduxContext";
function useSelectorWithStore(selector, store) {
  let [, forceRender] = useReducer((x) => x + 1, 0); //useState
  let storeState = store.getState(); //获取总状态
  let selectedState = selector(storeState);
  useLayoutEffect(() => {
    return store.subscribe(forceRender);
  }, [store]);
  return selectedState;
}
function useSelector(selector) {
  const { store } = useContext(ReactReduxContext);
  const selectedState = useSelectorWithStore(
    //选择器 比较两个值是否相等
    selector,
    store
  );
  return selectedState;
}

export default useSelector;
