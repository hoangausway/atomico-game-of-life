/*
  General store for streams which affect our component.
  There're 2 groups of streams:
  - created by user interaction (click, typing, etc.)
  - created by system (tick)
  
  Our component will react to following events:
  - toggle cell, triggered when user clicks on a cell in grid
  - reset, triggered when user clicks button [RESET]
  - pause/activate, triggered when user clicks button [PAUSE/CONTINUE]
  - automatic update grid based on 'rule-of-life' logics; this event will be triggered by background 'tick'

  METHODOLOGY:
  (1) [PURE] In this module 'gaemoflife-streams'
      With above events in mind, we prepare the corresponding streams using RxJS observables.
      Here's stores 'streams of events'

  (2) [PURE] In module 'world-stream'
      The app's logics are implemented in separate module 'world-stream',
      in which the streams are transforming appropriatelly.
      This module plays role of 'reducer'.

  (3) [SIDE EFFECT] In main module 'game-of-life'
      Later on, in the main module of component we subscribe to world stream and perform side effects.
      Interesting things happen. User interacts with app and watch results.
*/

// eslint-disable-next-line
import { filter, map, scan, startWith, switchMap, tap } from 'rxjs/operators'
import { interval, merge, Subject } from 'rxjs'

/*
  makes an event stream with Subject which will be triggered by event emitter
*/
const streamEmitter = () => {
  const eventStream$ = new Subject() // useMemo(() => new Subject(), [])
  const eventEmitter = e => eventStream$.next(e) // useCallback(e => eventStream$.next(e))
  return [eventStream$, eventEmitter]
}

/*
  define and pre-process needed streams
*/
;(function () {
  if (window.GameOfLifeStreams) return window.GameOfLifeStreams
  // event type constants
  const eventTypes = {
    RESET: 'event_reset',
    TOGGLE: 'event_toggle',
    TICK: 'event_tick'
  }

  const TICK = 500

  // define event streams and related triggers
  const [toggleEvent$, toggleEmitter] = streamEmitter()
  const [resetEvent$, resetEmitter] = streamEmitter()
  const [activeEvent$, activateEmitter] = streamEmitter()

  // define and preprocess streams
  const toggle$ = toggleEvent$.pipe(
    map(e => ({
      event_type: eventTypes.TOGGLE,
      event_payload: e.detail
    }))
  )

  const reset$ = resetEvent$.pipe(
    map(e => ({
      event_type: eventTypes.RESET
    }))
  )

  const tick$ = interval(TICK).pipe(map(e => ({ event_type: eventTypes.TICK })))

  const activeTick$ = merge(tick$, activeEvent$).pipe(
    scan(
      (prev, e) => ({
        ...e,
        active: e.event_type === eventTypes.TICK ? prev.active : !prev.active
      }),
      { active: true }
    ),
    filter(e => e.active)
  )

  // transform the active stream for tracking and responding paused value if needed
  const active$ = activeEvent$.pipe(scan((active, event) => !active, true))

  window.GameOfLifeStreams = {
    eventTypes: eventTypes,
    tick: TICK,
    toggle: [toggle$, toggleEmitter],
    reset: [reset$, resetEmitter],
    active: [active$, activateEmitter],
    activeTick: [activeTick$]
  }
})()
