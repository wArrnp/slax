import { BehaviorSubject } from 'rxjs';
import React from 'react';
// import ReactDom from 'react-dom';
import mergeObjectDeeper from './util';

export default class SlaxStore {
  constructor(initialState, reducers) {
    const store$ = new BehaviorSubject(initialState);

    this.store$ = store$;
    this.reducers = reducers;
  }

  subscribe(cb) {
    return this.store$.subscribe(cb);
  }

  dispatch(action) {
    const prevValue = this.store$.getValue();
    const actionResult = Object.keys(this.reducers)
      .reduce((acc, eachReducerName) => {
        return { ...acc, [eachReducerName]: {...this.reducers[eachReducerName](prevValue[eachReducerName], action)} }
      }, {})


    const newValue = mergeObjectDeeper(prevValue, actionResult);
    this.store$.next(newValue);
  }

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

class SlaxWrapper {
  constructor() {
    this.store = null;
  }

  createStore(reducers) {
    if(this.store === null) {
      const initialState = Object.keys(reducers)
      .reduce((acc, eachReducerName) => {
        return { ...acc, [eachReducerName]: reducers[eachReducerName](undefined, {type: null}) }
      }, {})

    this.store = new SlaxStore(initialState, reducers);
    }
  }

  dispatch(action) {
    if(!!this.store) {
      return this.store.dispatch(action);
    }
    return false;
  }

  connect(mapStateToProps, mapDispatchToProps) {
    if(!!this.store) {
      return this.store.connect(mapStateToProps, mapDispatchToProps);
    }
    return false;
  }

  subscribe(cb) {
    if(!!this.store) {
      return this.store.subscribe(cb);
    }
  }
}

const slaxWrapper = new SlaxWrapper();

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

export function createAction(type) {
  return function(payload){
    return {
      type,
      payload
    }
  }
}


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