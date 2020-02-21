import React from 'react';
import Slax, { connect } from '../../likesingleton';
import reducers from './modules';
import { incrementCount, decrementCount } from './modules/count';

Slax.createStore(reducers)

function IncreaseButton({increase}) {
  return <button onClick={() => increase(1)}>increase</button>
}

const LinkedIncreaseButton = connect(null, dispatch => ({
  increase: cnt => dispatch(incrementCount(cnt))
}))(IncreaseButton)

function DecreaseButton({decrease}) {
  return <button onClick={() => decrease(2)}>decrease</button>
}

const LinkedDecreaseButton = connect(null, dispatch => ({
  decrease: cnt => dispatch(decrementCount(cnt))
}))(DecreaseButton)


function Count({count}) {
  return <div>{count}</div>
}

const LinkedCount = connect(state => ({
  count: state.count.count
}), null)(Count);

export default function CountTest() {
  return (
    <div>
      <LinkedIncreaseButton />
      <LinkedDecreaseButton />
      <LinkedCount />
    </div>
  )
}