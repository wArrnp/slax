import { BehaviorSubject } from 'rxjs';
import React from 'react';
// // import ReactDom from 'react-dom';
import mergeObjectDeeper from './util';
import { StoreInitializeError } from './util/errors';



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

const Slax = (function() {
  let _store$ = null;
  let _reducers = {};

  function getProcessedReducers(reducers, reduceFunction) {
    return Object.keys(reducers).reduce(reduceFunction, {});
  }
  
  function dispatch(action) {
    if(!_store$) {
      throw new StoreInitializeError("Store is not initialized");
    }

    const prevValue = _store$.getValue();

    const reduceFunction = (acc, reducerName) => ({ ...acc, [reducerName]: _reducers[reducerName](prevValue[reducerName], action)});
    const actionResult = getProcessedReducers(_reducers, reduceFunction);

    const newValue = mergeObjectDeeper(prevValue, actionResult);
    _store$.next(newValue)
  }

  function ConnectComponent ({ store$, mapStateToProps, mapDispatchToProps,  Children }) {
    const [ storeState, setStoreState ] = React.useState({});

    React.useEffect(() => {
      if(!!mapStateToProps) {
        store$.subscribe(state => {
          setStoreState(mapStateToProps(state));
        })
      }
    },[])

  return <Children {...storeState} {...mapDispatchToProps(dispatch)} dispatch={dispatch}/>
  }

  return {
    createStore(reducers) {
      if(!!_store$) {
        throw new StoreInitializeError("Store is already initialized");
      }
    
      const reduceFunction = (acc, reducerName) => ({ ...acc, [reducerName]: reducers[reducerName](undefined, {type: null})});
      
      const initialState = getProcessedReducers(reducers, reduceFunction)
      _store$ = new BehaviorSubject(initialState);
      _reducers = reducers;
    },


    connect(mapStateToProps, mapDispatchToProps = f => f) {
      return function(Component) {
        return <ConnectComponent store$={_store$} mapStateToProps={mapStateToProps} mapDispatchToProps={mapDispatchToProps} Children={Component}/>
      }
    }
  }
})()

Slax.createAction = createAction;

export default Slax;
