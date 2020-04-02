/*
  Utility function
  Makes an event stream with Subject which will be triggered by event emitting
  () -> [stream$, eventEmit]
*/
import { Subject } from 'rxjs'

export default () => {
  const stream$ = new Subject()
  const eventEmit = e => stream$.next(e)
  return [stream$, eventEmit]
}
