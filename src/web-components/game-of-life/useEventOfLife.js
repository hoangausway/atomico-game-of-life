import { useEffect } from 'atomico'

// eslint-disable-next-line
import { map, scan, startWith, tap } from 'rxjs/operators'

import { WorldEventTypes, makeWorldStream } from './rulesOfLife'
import { useEventStream } from './useEventStream'

/*
INPUT
  observers:
  - worldObserver to observe combination of events: 'tick', 'toggle cell', and 'paused'
  - pauseObserver to observe event of 'paused' value
  - countObserver to observe event of 'number of live cells' value
  initialWorld: initial world state
  tick: time interval event
OUPUT
  handlers:
  - pauseEmit: triggers emitting of 'paused' event
  - toggleEmit: trigggers emitting of 'toggle cell' event
  - resetEmit: tigggers emitting of 'reset' event
*/
const useEventOfLife = (observers, initialWorld, initialResetEvent) => {
  const [worldObserver, pauseObserver, resetObserver] = observers

  // define events and related triggers
  const [toggleEmit, toggleEvent$] = useEventStream()
  const [pauseEmit, pauseEvent$] = useEventStream()
  const [resetEmit, resetEvent$] = useEventStream()

  // add events' types
  const reset$ = resetEvent$.pipe(
    map(e => ({
      ...e,
      world_event_type: WorldEventTypes.RESET,
      world_event_reset: e.world_event_reset
    })),
    startWith(initialResetEvent)
  )
  const toggle$ = toggleEvent$.pipe(
    map(e => ({
      ...e,
      world_event_type: WorldEventTypes.TOGGLE,
      world_event_cell: [parseInt(e.detail.col), parseInt(e.detail.row)]
    }))
  )
  const pause$ = pauseEvent$.pipe(
    map(e => ({ ...e, world_event_type: WorldEventTypes.ACTIVATE }))
  )

  // make stream of events which change the world state
  const worldStream$ = makeWorldStream(initialWorld, toggle$, pause$, reset$)

  // transform pauseClick event which change pauseText state
  const pauseStream$ = pauseEvent$.pipe(scan((paused, event) => !paused, true))

  useEffect(() => {
    const worldSub = worldStream$.subscribe(worldObserver)
    const pauseSub = pauseStream$.subscribe(pauseObserver)
    const resetSub = reset$.subscribe(resetObserver)

    return () => {
      worldSub.unsubscribe()
      pauseSub.unsubscribe()
      resetSub.unsubscribe()
    }
    // eslint-disable-next-line
  }, [])

  return [resetEmit, pauseEmit, toggleEmit]
}

export default useEventOfLife
