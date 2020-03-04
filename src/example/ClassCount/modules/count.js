const INCREMENT_COUNT = "INCREMENT_COUNT";
const DECREMENT_COUNT = "DECREMENT_COUNT";

export function incrementCount(count) {
  return {
    type: INCREMENT_COUNT,
    count
  }
}

export function decrementCount(count) {
  return {
    type: DECREMENT_COUNT,
    count
  }
}

const initialState = {
  count: 1
}

export default function reducer(state = initialState, action) {
  switch(action.type) {
    case INCREMENT_COUNT:
      return {
        count: state.count + action.count
      }
    case DECREMENT_COUNT:
      return {
        count: state.count - action.count
      }
    default:
      return state;
  }
}