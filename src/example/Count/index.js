import React from 'react';
import { createStore,  useSelect, useDispatch} from '../../likesingleton';
import reducers from './modules';
import { incrementCount, decrementCount } from './modules/count';

createStore(reducers)

function IncreaseButton({}) {
  const dispatch = useDispatch();
  return <button onClick={() => {
    dispatch(incrementCount(2));
  }}>increase</button>
}

function DecreaseButton({}) {
  const dispatch = useDispatch();

  return <button onClick={() => {
    dispatch(decrementCount(3))
  }}>decrease</button>
}

function Count() {
  const count = useSelect((state) => state.count.count)
  return <div>{count}</div>
}

export default function CountTest() {
  return (
    <div>
      <IncreaseButton />
      <DecreaseButton />
      <Count />
    </div>
  )
}