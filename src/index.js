import { Subject, BehaviorSubject } from 'rxjs';
import React from 'react';
// import ReactDom from 'react-dom';
import mergeObjectDeeper from './util';

export default class SlaxStore {
  constructor() {
    const initialState = {k1: {k1k1: 1, k1k2:2}, k2: {k2k1: 3, k2k2: 4}}
    const store$ = new BehaviorSubject(initialState);

    this.store$ = store$;
    this.reducers = {};
  }

  subscribe(cb) {
    return this.store$.subscribe(cb);
  }

  // setReducers(reducers) {
  //   this.reducers = reducers;
  // }

  dispatch(action) {
    const prevValue = this.store$.getValue();
    const newValue = mergeObjectDeeper(prevValue, action);
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

  // setInitialState(state) {

  // }  
}


function ConnectComponent ({ store$, mapStateToProps, mapDispatchToProps,  Children }) {
  const [ storeStateProps, setStoreStateProps ] = React.useState({});
  React.useEffect(() => store$.subscribe((state) => {
    setStoreStateProps(mapStateToProps(state));
  }),[])

  return <Children {...storeStateProps}/>
}

/* -- 이 이하는 테스트를 하기위하여 작성된 컴포넌트 입니다. 

const storeInstance = new SlaxStore();

let cnt = 2;
setInterval(() => {
  storeInstance.dispatch({
    k1 :{
      k1k1: cnt++
    }
  })
}, 1000)



function TestC({k1k1}) {
  return <p>{k1k1}</p>
}

ReactDom.render(
  <div>
    {storeInstance.connect((state) => ({
      k1k1: state.k1.k1k1
    }))(TestC)}
  </div>,
  document.getElementById('root')
)

*/