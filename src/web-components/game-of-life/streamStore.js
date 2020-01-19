/*
  General store for streams which affect our component.
  There're 2 groups of streams:
  - created by user interaction (click, typing, etc.)
  - created by system (tick)
  
  Our component will react to following events:
  - reset, triggered when user clicks button [RESET]
  - pause/activate, triggered when user clicks button [PAUSE/CONTINUE]
  - toggle cell, triggered whe user clicks on a cell in grid
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
import { interval } from 'rxjs'

import { useEventStream } from './useEventStream'

// event type constants
export const eventTypes = {
  RESET: 'event_reset',
  ACTIVATE: 'event_activate',
  TOGGLE: 'event_toggle',
  TICK: 'event_tick'
}

export const makeStreamStore = props => {
  const { tick } = props

  // define event streams and related triggers
  const [toggleEmitter, toggleEvent$] = useEventStream()
  const [activateEmitter, activeEvent$] = useEventStream()
  const [resetEmitter, resetEvent$] = useEventStream()

  const emitters = {}
  emitters[eventTypes.RESET] = resetEmitter
  emitters[eventTypes.ACTIVATE] = activateEmitter
  emitters[eventTypes.TOGGLE] = toggleEmitter

  // preprocess streams
  const streams = {}
  streams[eventTypes.RESET] = resetEvent$.pipe(
    map(e => ({
      ...e,
      event_type: eventTypes.RESET,
      event_payload: e.detail
    }))
  )

  streams[eventTypes.ACTIVATE] = activeEvent$.pipe(
    map(e => ({ ...e, event_type: eventTypes.ACTIVATE }))
  )

  streams[eventTypes.TOGGLE] = toggleEvent$.pipe(
    map(e => ({
      ...e,
      event_type: eventTypes.TOGGLE,
      event_payload: e.detail
    }))
  )

  streams[eventTypes.TICK] = interval(tick).pipe(
    map(e => ({ event_type: eventTypes.TICK }))
  )

  return { emitters, streams }
}
