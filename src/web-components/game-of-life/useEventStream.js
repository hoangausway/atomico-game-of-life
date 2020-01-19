import { useMemo } from 'atomico'
import { Subject } from 'rxjs'

/*
  returns
  eventEmit: emits stream triggered by a DOM/Custom event
  eventStream$: emitted stream
*/
export const useEventStream = (dependencies = []) => {
  const eventStream$ = useMemo(() => new Subject(), dependencies)
  const eventEmitter = e => eventStream$.next(e) // useCallback maybe OK here
  return [eventEmitter, eventStream$]
}
