/*
  The central store of streams which affect our component.
  It exports a global object named GameOfLifeStreams for components to use.

  As general rules, there're 2 groups of streams:
  - the streams triggered by user interaction (click, typing, etc.)
  - the streams created by system (tick)

  1. Create the pairs of raw streams and emitters (may be triggered by user interaction)
  2. Apply some simple transformation as required by business logics
  3. Exports as whole object (central store of streams) to global 'window'
  4. Components can access the store as neccessary. They can use as it or do further transformation.

  In this particular application, we will consider the following streams (and corresponding emitters):
  - stream of cell toggling event, triggered when user clicks on a cell in the grid
  - stream of 'reset' event, triggered when user made a 'reset' action (for example: clicks on some [RESET] button)
  - stream of 'pause/activate' event, triggered when user made a 'pause/continue' action (clicks button [PAUSE/CONTINUE])
  - stream of ticks, which will automatically update grid based on 'rule-of-life' logics
    (this stream is triggered by background 'tick' which taking account of 'pause/activate' events

  NOTES:
  - All transformations in this module are pure functions
  - The components which use these streams will subscribe/unsubscribe them as side effects
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
