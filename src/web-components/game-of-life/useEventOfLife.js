import { useEffect } from 'atomico'

// eslint-disable-next-line
import { filter, map, scan, startWith, switchMap, tap } from 'rxjs/operators'
import { merge, interval } from 'rxjs'

import { updateWorld, toggleCell } from './rulesOfLife'
import { useEventStream } from './useEventStream'

/*
INPUT
  observers:
  - worldObserver to observe combination of events: 'tick', 'toggle cell', and 'paused'
  - pauseObserver to observe event of 'paused' value
  initialWorld: initial world state
  initialResetEvent: initial reset event
OUPUT
  handlers:
  - pauseEmit: triggers emitting of 'paused' event
  - toggleEmit: trigggers emitting of 'toggle cell' event
  - resetEmit: tigggers emitting of 'reset' event
*/
const useEventOfLife = (observers, initialWorld, initialTick) => {
  const [worldObserver, pauseObserver, resetObserver] = observers

  // define event streams and related triggers
  const [toggleEmit, toggleEvent$] = useEventStream()
  const [pauseEmit, pauseEvent$] = useEventStream()
  const [resetEmit, resetEvent$] = useEventStream()

  // preprocess streams
  const reset$ = resetEvent$.pipe(
    map(e => ({
      ...e,
      world_event_type: WorldEventTypes.RESET,
      world_event_reset: e.detail
    })),
    startWith(
      new window.CustomEvent('reset', {
        detail: { tick: initialTick, world: initialWorld }
      })
    )
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

  // make combined stream of events which change the world state
  const worldStream$ = makeWorldStream(
    initialWorld,
    initialTick,
    toggle$,
    pause$,
    reset$
  )

  // optional: transform the pauseStream.
  // It's observer can track paused value and respond if needed.
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

// Helpers
// return stream of world events
// event type constants
const WORLD_EVENT_RESET = 1
const WORLD_EVENT_ACTIVATE = 2
const WORLD_EVENT_TOGGLE = 3
const WORLD_EVENT_TICK = 4

export const WorldEventTypes = {
  RESET: WORLD_EVENT_RESET,
  ACTIVATE: WORLD_EVENT_ACTIVATE,
  TOGGLE: WORLD_EVENT_TOGGLE
}

const makeWorldStream = (
  initialWorld,
  initialTick,
  pause$,
  toggle$,
  reset$
) => {
  const tick$ = reset$
    .pipe(switchMap(e => interval(initialTick)))
    .pipe(map(e => ({ world_event_type: WORLD_EVENT_TICK })))

  const update$ = merge(reset$, toggle$, pause$, tick$).pipe(
    scan(
      (prev, e) => ({
        ...e,
        active:
          e.world_event_type === WORLD_EVENT_ACTIVATE
            ? !prev.active
            : prev.active
      }),
      { active: true }
    ),

    filter(
      e =>
        e.world_event_type === WORLD_EVENT_TOGGLE ||
        e.world_event_type === WORLD_EVENT_RESET ||
        (e.world_event_type === WORLD_EVENT_TICK && e.active)
    )
  )

  const updateWorldFunc$ = update$.pipe(
    map(e => {
      switch (e.world_event_type) {
        case WORLD_EVENT_TICK:
          return world => updateWorld(world)
        case WORLD_EVENT_TOGGLE: {
          const [col, row] = e.world_event_cell
          return world => toggleCell(world, col, row)
        }
        case WORLD_EVENT_RESET: {
          return world => updateWorld(e.world_event_reset.world)
        }
        default:
      }
    })
  )

  return updateWorldFunc$.pipe(scan((world, f) => f(world), initialWorld))
}
