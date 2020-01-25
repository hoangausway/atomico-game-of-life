/*
  Implement app's logics by transforming the streams provided by 'Stream Store'.
*/

// eslint-disable-next-line
import { filter, map, scan, startWith, switchMap, tap } from 'rxjs/operators'
import { merge } from 'rxjs'

import { updateWorld, toggleCell, drawPattern } from './rules-of-life'
import patternCollection from './patterns'
/*
  exports predefined pattern samples
*/
export const patternKeys = Object.keys(patternCollection) // ['EMPTY', 'TOAD', ...]
export const patterns = patternCollection
export const makeInitialWorld = patternName => {
  const pattern = patternName || 'QUEEN_BEE_SHUTTLE'
  const matrix = patterns[pattern.toUpperCase()] || []
  return drawPattern(40, 40, { matrix, col0: 5, row0: 5 })
}

// world reducing; resulting function signature is f: world => world
const { eventTypes } = window.GameOfLifeStreams // eventTypes defs from GaemOfLifeStreams
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

/*
  make stream of functions which then update the world
*/
const EMPTY = { arr: [] }
export const makeStreamsOfLife = (
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
