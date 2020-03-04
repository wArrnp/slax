import React from 'react';
import { createStore, connect } from '../../likesingleton';
import reducers from './modules';
import { incrementCount, decrementCount } from './modules/count';

createStore(reducers)

function IncreaseButton({ incrementCount }) {
  return <button onClick={() => incrementCount(2)}>increase</button>
}

const IB = connect(null, dispatch => ({
  incrementCount: (cnt) => dispatch(incrementCount(cnt))
}))(IncreaseButton);

function DecreaseButton({decrementCount}) {
  return <button onClick={() => decrementCount(3)}>decrease</button>
}

const DB = connect(null, dispatch => ({
  decrementCount: (cnt) => dispatch(decrementCount(cnt))
}))(DecreaseButton)

function Count({count}) {
  return <div>{count}</div>
}

const CC = connect(state => ({
  count: state.count.count
}), null)(Count);



export default function CountTest() {
  return (
    <div>
      <IB />
      <DB />
      <CC />
    </div>
  )
}