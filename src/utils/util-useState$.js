/*
  Utility function
  Returns state as stream's emitting value.
  (state$, initialState) -> state
*/
import { useState, useEffect } from 'atomico'

export default (state$, initialState) => {
  const [state, setState] = useState(initialState)
  useEffect(() => {
    const sub = state$.subscribe(setState)
    return () => sub.unsubscribe()
  }, [])
  return state
}
