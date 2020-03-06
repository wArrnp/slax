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


// 싱글톤 스토어로 만들기 위한 즉시 실행 함수, 외부에서 _store$에 직접적으로 접근하지 못하게 하기 위함이다.
const Slax = (function() {
  let _store$ = null;
  let _reducers = {};

  // dispatch 함수는 스토어에 있는 값을 변경하기 위한 액션을 발생시키는 함수이다.
  function dispatch(action) {
    if(!_store$) {
      throw new StoreInitializeError("Store is not initialized");
    }
    // 현재 존재하는 값과 액션이 리턴한 값을 합쳐야 하기 때문에 현재 값을 가져온다.
    const prevValue = _store$.getValue();

    // 리듀스 함수들을 모두 실행시킨다.
    const reduceFunction = (acc, reducerName) => ({ ...acc, [reducerName]: _reducers[reducerName](prevValue[reducerName], action)});
    const actionResult = getReducedValue(_reducers, reduceFunction);

    const newValue = mergeObjectDeeper(prevValue, actionResult);
    _store$.next(newValue)
  }
  

  return {
    // 스토어를 생성하는 함수, 리듀서를 등록하고 그 리듀서로 초기값을 정의한다.
    createStore(reducers) {
      if(!!_store$) {
        throw new StoreInitializeError("Store is already initialized");
      }
    
      const reduceFunction = (acc, reducerName) => ({ ...acc, [reducerName]: reducers[reducerName](undefined, {type: null})});
      
      const initialState = getReducedValue(reducers, reduceFunction)
      _store$ = new BehaviorSubject(initialState);
      _reducers = reducers;
    },

    // 컴포넌트와 스토어를 연결시켜주기 위한 함수이다. 클래스형 컴포넌트를 지원하기 위해서 만들어졌다.
    connect(mapStateToProps=()=>({}), mapDispatchToProps=()=>({})) {
      if(!_store$) {
        throw new StoreInitializeError("Store is not initialized");
      }

      if(mapStateToProps === null) mapStateToProps = () => ({})
      if(mapDispatchToProps === null) mapDispatchToProps = () => ({})
      
      function createConnectHOC(Component) {
        return function ConnectHOC() {
          const [ storeStateProps, setStoreStateProps ] = useState({});
          useEffect(() => {
            _store$.subscribe((state) => {
              setStoreStateProps(mapStateToProps(state));
            })
          },[])

          return <Component {...storeStateProps} {...mapDispatchToProps(dispatch)}/>
        }
      }
      return createConnectHOC
    },

    // connect 함수에서, state만을 분리하여 hooks를 이용해 만든 함수이다.
    // 함수형 컴포넌트에서 사용할 수 있다.
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

    // connect 함수를 통해서 dispatch 하던 것을 분리하여 hooks로 만든 함수이다.
    // 사실 dispatch 리턴을 해줌으로써 액션을 실행시키는 것으로 직접적인 역할은 없다.
    useDispatch() {
      return dispatch;
    }
  }
})()

// Slax 싱글톤 메소드를 제외한 추가 제공 함수들을 묶어준다.
Slax.createAction = createAction;
Slax.combineReducers = combineReducers;

// 한번에 import하는 것이 아니라 필요한 것만 할 수 있도록 분리시켜 export해준다.
export const connect = Slax.connect;
export const createStore = Slax.createStore;
export const useSelect = Slax.useSelect;
export const useDispatch = Slax.useDispatch;
export default Slax;
