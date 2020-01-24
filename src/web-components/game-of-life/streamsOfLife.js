/*
  Implement app's logics by transforming the streams provided by 'Stream Store'.
*/

// eslint-disable-next-line
import { filter, map, scan, startWith, switchMap, tap } from 'rxjs/operators'
import { merge } from 'rxjs'

import { updateWorld, toggleCell, drawPattern } from './rulesOfLife'
import patterns from './patterns'
const { eventTypes } = window.StreamStore

// world reducing; resulting function signature is f: world => world
const worldReducer = e => {
  switch (e.event_type) {
    case eventTypes.TOGGLE: {
      const col = parseInt(e.event_payload.col)
      const row = parseInt(e.event_payload.row)
      return world => toggleCell(world, col, row)
    }
    case eventTypes.TICK:
      return world => updateWorld(world)
    case eventTypes.RESET: {
      return world => updateWorld(makeInitialWorld())
    }
    default:
  }
}

const eventTypeFilter = e =>
  e.event_type === eventTypes.TOGGLE ||
  e.event_type === eventTypes.RESET ||
  e.event_type === eventTypes.TICK

const initialPattern = 'QUEEN_BEE_SHUTTLE'
// const initialPattern = 'TOAD'
export const makeInitialWorld = () => {
  const matrix = patterns[initialPattern]
  return drawPattern(40, 40, { matrix, col0: 5, row0: 5 })
}

const EMPTY = { arr: [] }
// make stream of functions which evolve world
export const streamsOfLife = (
  toggle$,
  reset$,
  activeTick$,
  initialWorld = EMPTY
) => {
  // transform world stream
  const world$ = merge(toggle$, reset$, activeTick$).pipe(
    filter(eventTypeFilter), // filter interested streams
    map(worldReducer), // reduce events to world update functions ---function---function---function
    scan((world, f) => f(world), initialWorld) // scan as the world evolves ---world---world---
  )
  return world$
}
