/*
  Implement app's logics by transforming the state streams provided by 'Stream Store'.
*/

// eslint-disable-next-line
import { filter, map, scan, startWith, switchMap, tap } from 'rxjs/operators'
import { merge } from 'rxjs'

import { updateWorld, toggleCell } from './rulesOfLife'
import { eventTypes, makeStreamStore } from './streamStore'

// world reducing; resulting function signature is f: world => world
const worldReducer = e => {
  switch (e.event_type) {
    case eventTypes.TICK:
      return world => updateWorld(world)
    case eventTypes.TOGGLE: {
      const col = parseInt(e.event_payload.col)
      const row = parseInt(e.event_payload.row)
      return world => toggleCell(world, col, row)
    }
    case eventTypes.RESET: {
      return world => updateWorld(e.event_payload.world)
    }
    default:
  }
}

const eventTypeFilter = e =>
  e.event_type === eventTypes.TOGGLE ||
  e.event_type === eventTypes.RESET ||
  e.event_type === eventTypes.TICK

// make stream of functions which evolve world
const worldFunc$ = (streams, active) => {
  const worldFunc$ = merge(
    streams[eventTypes.RESET],
    streams[eventTypes.TOGGLE],
    streams[eventTypes.TICK]
  ).pipe(
    // filter interested streams
    filter(eventTypeFilter),
    // reduce
    map(worldReducer)
  )

  return worldFunc$
}

const streamsOfLife = props => {
  const { tick, active, initialWorld } = props

  // transfrom streams as game's business requires
  const { emitters, streams } = makeStreamStore({ tick })

  // transform world stream
  const world$ = worldFunc$(streams, active).pipe(
    scan((world, f) => f(world), initialWorld)
  )

  // transform the active stream for tracking and responding paused value if needed
  const activate$ = streams[eventTypes.ACTIVATE].pipe(
    scan((active, event) => !active, active)
  )

  const reset$ = streams[eventTypes.RESET]
  return { world$, activate$, reset$, emitters }
}

export default streamsOfLife
