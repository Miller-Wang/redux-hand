import React, { useContext } from "react";
import { bindActionCreators } from "../redux";
import ReactReduxContext from "./ReactReduxContext";

// 类组件实现
function connect(mapStateToProps, actions) {
  return function (OldComponent) {
    return class NewComponent extends React.Component {
      static contextType = ReactReduxContext;
      constructor(props, context) {
        super(props, context);
      }
      componentDidMount() {
        this.unsubscribe = this.context.store.subscribe(() =>
          this.forceUpdate()
        );
      }
      componentWillUnmount() {
        this.unsubscribe();
      }
      render() {
        const { store } = this.context;
        const state = store.getState();
        const stateProps = mapStateToProps(state);
        const dispatchProps = bindActionCreators(actions, store.dispatch);
        return (
          <OldComponent {...this.props} {...stateProps} {...dispatchProps} />
        );
      }
    };
  };
}

/**
 * 函数组件实现
 * 把组件和仓库进行关联
 * 两条路或者说有两个方向
 * 1.输入 把仓库中中的状态输入或者 说传入组件，让组件可以显示  mapStateToProps
 * 2.输出 可以让组件里的操作改变仓库中状态 actions
 * 另外 为了让组件读取到最新的仓库中的状态。当仓库状态改变后，要通知组件刷新
 * @param {*} mapStateToProps 把仓库状态映射为属性
 * @param {*} mapDispatchToProps 把store.dispatch方法映射为属性
 */
function functionConnect(mapStateToProps, mapDispatchToProps) {
  return function (OldComponent) {
    function NewComponent(props) {
      const { store } = useContext(ReactReduxContext);
      const state = store.getState(); //获取仓库中的总状态
      //let mapStateToProps = state=>state.counter1;
      //19行以state为依赖 33行以store为优化
      const stateProps = React.useMemo(() => {
        console.log("重新计算stateProps");
        return mapStateToProps(state);
      }, [state]);
      //const dispatchProps = bindActionCreators(actions,store.dispatch);
      //组件重新渲染不是因为store变了更新状态么 那这里为何以store为依赖优化？
      //即store里的状态改变了，也不需要重新计算
      let dispatchProps = React.useMemo(() => {
        console.log("重新计算dispatchProps");
        let dispatchProps;
        if (typeof mapDispatchToProps === "object") {
          dispatchProps = bindActionCreators(
            mapDispatchToProps,
            store.dispatch
          );
        } else if (typeof mapDispatchToProps === "function") {
          dispatchProps = mapDispatchToProps(store.dispatch);
        } else {
          dispatchProps = { dispatch: store.dispatch };
        }
        return dispatchProps;
      }, [store.dispatch]);
      //调用updateComponent的目的就是让状态改变，让组件更新
      //const [,updateComponent] = React.useReducer(()=>({}));
      const [, setState] = React.useState({});
      //里面可以编写一个订阅，订阅仓库中的状态变化 事件，仓库的状态发生变化后可以调用forceUpdate
      //从而让组件进行刷新，为了保证只需要订阅一次，所以可以写个依赖项store
      React.useEffect(() => {
        let unsubscribe = store.subscribe(() => setState({}));
        //这个函数的返回值 React会存起来，会在下次执行回调之前的执行
        return unsubscribe;
      }, [store]);
      //把返回的对象当成了OldComponent组件的属性 stateProps={number:5}
      return <OldComponent {...props} {...stateProps} {...dispatchProps} />;
    }
    return NewComponent;
  };
}

export default connect;
