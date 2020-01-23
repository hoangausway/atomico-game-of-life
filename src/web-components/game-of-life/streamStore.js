/*
  General store for streams which affect our component.
  There're 2 groups of streams:
  - created by user interaction (click, typing, etc.)
  - created by system (tick)
  
  Our component will react to following events:
  - toggle cell, triggered whe user clicks on a cell in grid
  - reset, triggered when user clicks button [RESET]
  - pause/activate, triggered when user clicks button [PAUSE/CONTINUE]
  - automatic update grid based on 'rule-of-life' logics; this event will be triggered by background 'tick'

  METHODOLOGY:
  (1) [PURE] In this module 'streamStore'
      With above events in mind, we prepare the corresponding streams using RxJS observables.
      Here's stores 'streams of events'

  (2) [PURE] In module 'streamOfLife'
      The app's logics are implemented in separate module 'streamOfLife',
      in which the streams are transforming appropriatelly.
      This module plays role of 'reducer'.

  (3) [SIDE EFFECT] In main module 'game-of-life'
      Later on, in the main module of component we subscribe to these streams and perform side effects.
      Interesting things happen. User interacts with app and watch results.
*/

// eslint-disable-next-line
import { filter, map, scan, startWith, switchMap, tap } from 'rxjs/operators'
import { interval, merge } from 'rxjs'

import { useEventStream } from './useEventStream'

// event type constants
export const eventTypes = {
  RESET: 'event_reset',
  TOGGLE: 'event_toggle',
  TICK: 'event_tick'
}

export const makeStreamStore = props => {
  const { tick } = props

  // define event streams and related triggers
  const [toggleEmitter, toggleEvent$] = useEventStream()
  const [resetEmitter, resetEvent$] = useEventStream()
  const [activateEmitter, activeEvent$] = useEventStream()

  // define and preprocess streams
  const toggle$ = toggleEvent$.pipe(
    map(e => ({
      event_type: eventTypes.TOGGLE,
      event_payload: e.detail
    }))
  )

  const reset$ = resetEvent$.pipe(
    map(e => ({
      event_type: eventTypes.RESET,
      event_payload: e.detail
    }))
  )

  const tick$ = interval(tick).pipe(map(e => ({ event_type: eventTypes.TICK })))

  const activeTick$ = merge(tick$, activeEvent$).pipe(
    scan(
      (prev, e) => ({
        ...e,
        active:
          e.event_type === eventTypes.TICK ? prev.active : !prev.active
      }),
      { active: false }
    ),
    filter(e => e.active)
  )

  // transform the active stream for tracking and responding paused value if needed
  const active$ = activeEvent$.pipe(
    scan((active, event) => !active, false)
  )
  
  return {
    toggle: [toggle$, toggleEmitter],
    reset: [reset$, resetEmitter],
    active: [active$, activateEmitter],
    activeTick: [activeTick$]
  }
}
