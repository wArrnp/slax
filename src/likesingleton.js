import { BehaviorSubject } from 'rxjs';
import React, { useState, useEffect } from 'react';
import { mergeObjectDeeper, getReducedValue } from './util';
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

export function combineReducers(reducers) {
  return reducers;
}


const Slax = (function() {
  let _store$ = null;
  let _reducers = {};

  function dispatch(action) {
    if(!_store$) {
      throw new StoreInitializeError("Store is not initialized");
    }

    const prevValue = _store$.getValue();

    const reduceFunction = (acc, reducerName) => ({ ...acc, [reducerName]: _reducers[reducerName](prevValue[reducerName], action)});
    const actionResult = getReducedValue(_reducers, reduceFunction);

    const newValue = mergeObjectDeeper(prevValue, actionResult);
    _store$.next(newValue)
  }
  

  return {
    createStore(reducers) {
      if(!!_store$) {
        throw new StoreInitializeError("Store is already initialized");
      }
    
      const reduceFunction = (acc, reducerName) => ({ ...acc, [reducerName]: reducers[reducerName](undefined, {type: null})});
      
      const initialState = getReducedValue(reducers, reduceFunction)
      _store$ = new BehaviorSubject(initialState);
      _reducers = reducers;
    },

    connect(mapStateToProps, mapDispatchToProps) {
      if(!_store$) {
        throw new StoreInitializeError("Store is not initialized");
      }
      
      function createConnectHOC(Component) {
        return function ConnectHOC() {
          const [ storeStateProps, setStoreStateProps ] = useState({});
          useEffect(() => store$.subscribe((state) => {
            setStoreStateProps(mapStateToProps(state));
          }),[])

          return <Component {...storeStateProps} {...mapDispatchToProps(dispatch)}/>
        }
      }
      return createConnectHOC
    },

    useSelect(mapStateToProps) {
      if(!_store$) {
        throw new StoreInitializeError("Store is not initialized");
      }

      const [ storeState, setStoreState ] = useState(null);

      useEffect(() => {
        _store$.subscribe((state) => {
          setStoreState(mapStateToProps(state));
        })
      }, [])

      return storeState;
    },

    useDispatch() {
      return dispatch;
    }
  }
})()

Slax.createAction = createAction;
Slax.combineReducers = combineReducers;
export const connect = Slax.connect;
export const createStore = Slax.createStore;
export const useSelect = Slax.useSelect;
export const useDispatch = Slax.useDispatch;
export default Slax;
