/*
  Implement app's logics by transforming the state streams provided by 'Stream Store'.
*/

// eslint-disable-next-line
import { filter, map, scan, startWith, switchMap, tap } from 'rxjs/operators'
import { merge } from 'rxjs'

import { updateWorld, toggleCell } from './rulesOfLife'
import { eventTypes, makeStreamStore } from './streamStore'

// make world state stream which evolves world from intitialWorld
const worldFunc$ = streams => {
  const update$ = merge(
    streams[eventTypes.RESET],
    streams[eventTypes.TOGGLE],
    streams[eventTypes.ACTIVATE],
    streams[eventTypes.TICK]
  ).pipe(
    // add property 'active' to combined stream
    scan(
      (prev, e) => ({
        ...e,
        active:
          e.event_type === eventTypes.ACTIVATE ? !prev.active : prev.active
      }),
      { active: false } // start with active = false
    ),
    // pick only interesting event types and if 'active' is true
    filter(
      e =>
        e.event_type === eventTypes.TOGGLE ||
        e.event_type === eventTypes.RESET ||
        (e.event_type === eventTypes.TICK && e.active)
    )
  )

  // make a stream of functions which reflect events affecting the world state
  // resulting function signature is f: world => world
  const func$ = update$.pipe(
    map(e => {
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
    })
  )

  return func$
}

const streamsOfLife = props => {
  // transfrom streams as game's business requires
  const { emitters, streams } = makeStreamStore({ tick: props.tick })

  // transform world stream
  const world$ = worldFunc$(streams).pipe(
    scan((world, f) => f(world), props.initialWorld)
  )

  // transform the active stream for tracking and responding paused value if needed
  const activate$ = streams[eventTypes.ACTIVATE].pipe(
    scan((active, event) => !active, props.active)
  )

  const reset$ = streams[eventTypes.RESET]
  return { world$, activate$, reset$, emitters }
}

export default streamsOfLife
