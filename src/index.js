import { BehaviorSubject } from 'rxjs';
import React from 'react';
// import ReactDom from 'react-dom';
import mergeObjectDeeper from './util';

// Slax의 Store 코어 부분을 담당하는 class이다.
// 실질적으로 Store 관리에 필요한 코드만 갖고자 한다.
// Slax를 사용할 때에는 SlaxStore Instance가 있다는 가정하에 움직인다.
class SlaxStore {
  constructor(initialState, reducers) {
    const store$ = new BehaviorSubject(initialState);

    this.store$ = store$;
    this.reducers = reducers;
  }

  // RxJS Subject에 구독하는 코드
  // 콜백으로 값이 변경했을 때 이뤄지는 함수를 넘긴다.
  subscribe(cb) {
    return this.store$.subscribe(cb);
  }

  // Store의 값을 변경하고자 할 때 실행하는 함수
  // 값을 변경하고자 하는 행위를 Action이라고 하며 Action은 Type이 필수로 정의되어 있어야 한다.
  // Action에 파라미터가 존재할 경우 파라미터를 함께 넣어준다.
  // Action Function은 함수이며 Action Type을 미리 정의해야 한다.
  // Reducer를 통해서 액션으로 인하여 바뀌는 스토어를 정의할 수 있다.
  dispatch(action) {
    const prevValue = this.store$.getValue();
    const actionResult = Object.keys(this.reducers)
      .reduce((acc, eachReducerName) => {
        return { ...acc, [eachReducerName]: {...this.reducers[eachReducerName](prevValue[eachReducerName], action)} }
      }, {})


    const newValue = mergeObjectDeeper(prevValue, actionResult);
    this.store$.next(newValue);
  }

  // 컴포넌트와 Slax Store를 연결할 때 사용되는 함수
  // Slax Store의 값을 사용하거나 값을 변경하고자 할 때 필수로 사용해야한다.
  connect(mapStateToProps, mapDispatchToProps) {
    return (Component) => {
      return <ConnectComponent 
        store$={this.store$} 
        mapStateToProps={mapStateToProps} 
        mapDispatchToProps={mapDispatchToProps} 
        Children={Component}/>
    }
  }
}

// 싱글톤 방식으로 개발하기 위해서 만든 Instance Wrapper
// 이 방식은 전체적인 아키텍쳐를 수정하면서 바뀔 예정이다.
class SlaxWrapper {
  constructor() {
    this.store = null;
  }

  // 싱글톤 방식을 채택하기 위하여 인스턴스를 하나 만드는 과정이다.
  // 기본 값을 설정하기 위하여 설정해준 리듀서들을 한번씩 실행하여 기본 값을 구한다.
  // 구한 기본 값과 리듀서를 Slax Store 인스턴스를 만들 때에 추가해준다.
  createStore(reducers) {
    if(this.store === null) {
      const initialState = Object.keys(reducers)
      .reduce((acc, eachReducerName) => {
        return { ...acc, [eachReducerName]: reducers[eachReducerName](undefined, {type: null}) }
      }, {})

    this.store = new SlaxStore(initialState, reducers);
    }
  }

  // Slax Store 인스턴스가 존재할 때에만 실행하도록 한다.
  dispatch(action) {
    if(!!this.store) {
      return this.store.dispatch(action);
    }
    return false;
  }

  // Slax Store 인스턴스가 존재할 때에만 실행하도록 한다.
  connect(mapStateToProps, mapDispatchToProps) {
    if(!!this.store) {
      return this.store.connect(mapStateToProps, mapDispatchToProps);
    }
    return false;
  }

  // Slax Store 인스턴스가 존재할 때에만 실행하도록 한다.
  subscribe(cb) {
    if(!!this.store) {
      return this.store.subscribe(cb);
    }
  }
}

const slaxWrapper = new SlaxWrapper();

// 직접적으로 Store에 접근하지 못하게 하기 위해서 메소드를 래핑하여 함수로 export 하였다.
// 이 방식은 전체적인 아키텍쳐를 수정하면서 바뀔 예정이다.
export function createStore(reducers) {
  return slaxWrapper.createStore(reducers);
}

export function dispatch(action) {
  return slaxWrapper.dispatch(action);
}

export function connect(mapStateToProps, mapDispatchToProps) {
  return slaxWrapper.connect(mapStateToProps, mapDispatchToProps);
}

export function subscribe(cb) {
  return slaxWrapper.subscribe(cb);
}

// 액션 함수를 만드는 것을 돕는 createAction 함수이다. 
// 액션 타입을 정의해서 인자로 넘겨주면 action 함수를 리턴해준다.
// Action 함수가 인자를 필요로 하면 인자를 받아 payload라는 이름으로 리듀서에 넘겨준다.
export function createAction(type) {
  return function(payload){
    return {
      type,
      payload
    }
  }
}

// Connect Function을 사용한 후 Slax Store의 값이 변할 때마다 렌더링을하기 위해서 만들어준 Component이다.
function ConnectComponent ({ store$, mapStateToProps, mapDispatchToProps,  Children }) {
  const [ storeStateProps, setStoreStateProps ] = React.useState({});
  React.useEffect(() => store$.subscribe((state) => {
    setStoreStateProps(mapStateToProps(state));
  }),[])

  return <Children {...storeStateProps} {...mapDispatchToProps(dispatch)} dispatch={dispatch}/>
}

/* -- 이 이하는 테스트를 하기위하여 작성된 컴포넌트 입니다. 

createStore({
  k1: function(state = { k1k1: 1, k1k2:2 }, action) {
    switch(action.type) {
      case "INCREASE_K1K1":
        return {
          k1k1: state.k1k1 + 1
        }
      case "INCREASE_K1K1_A2":
        return {
          k1k1: state.k1k1 + action.number
        }
      default: 
        return state;
    }
  },
  k2: function(state = { k2k1: 1, k2k2: 2 }, action) {
    switch(action.type) {
      case "INCRESE_K2K1": 
        return {
          k2k1: state.k2k1 + 1
        }
      default:
        return state;
    }
  }
})

function TestC({k1k1, increaseK2}) {
  let cnt = 1;
  React.useEffect(() => {
    setInterval(() => increaseK2(cnt ++), 1000); 
  }, [])
  return <p>{k1k1}</p>
}

function increaseK1A() {
  return {
    type: "INCREASE_K1K1"
  }
}

function increaseK1A2(number) {
  return {
    type: "INCREASE_K1K1_A2",
    number
  }
}

ReactDom.render(
  <div>
    {connect((state) => ({
      k1k1: state.k1.k1k1
    }), (dispatch) => ({
      increaseK2: (n) => dispatch(increaseK1A2(n))
    }))(TestC)}
  </div>,
  document.getElementById('root')
)
*/