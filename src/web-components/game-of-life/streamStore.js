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
