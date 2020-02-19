import React from 'react';
import ReactDom from 'react-dom';
import Slax from '../../likesingleton';
import reducers from './modules';
import { incrementCount, decrementCount } from './modules/count';

Slax.createStore(reducers)

function IncreaseButton({increaseButton}) {
  return <button onClick={() => increaseButton(1)}>increase</button>
}

const LinkedIncreaseButton = Slax.connect(null, dispatch => ({
  increase: cnt => dispatch(incrementCount(cnt))
}))(IncreaseButton)

function DecreaseButton({decreaseButton}) {
  return <button onClick={() => decreaseButton(2)}>decrease</button>
}

const LinkedDecreaseButton = Slax.connect(null, dispatch => ({
  decrease: cnt => dispatch(decrementCount(cnt))
}))(DecreaseButton)

const LinkedCount = Slax.connect(state => ({
  count: state.count.count
}), null)(Count);

function Count({count}) {
  return <div>{count}</div>
}

export default () => ReactDom.render(
  <div>
    <LinkedIncreaseButton />
    <LinkedDecreaseButton />
    <LinkedCount />
  </div>, 
  document.getElementById("root")
);