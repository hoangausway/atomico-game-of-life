import { useMemo } from 'atomico'
import { Subject } from 'rxjs'

/*
  returns
  eventEmit: emit stream triggered by a DOM/Custom event
  eventStream$: emitted stream
*/
export const useEventStream = () => {
  const eventStream$ = useMemo(() => new Subject(), [])
  const eventEmit = e => eventStream$.next(e) // useCallback maybe OK here
  return [eventEmit, eventStream$]
}
