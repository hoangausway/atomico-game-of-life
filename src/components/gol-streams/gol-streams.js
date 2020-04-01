/*
  The central store of streams which affect our component.
  It exports a global object named GameOfLifeStreams for components to use.

  As general rules, there're 2 groups of streams:
  - the streams triggered by user interaction (click, typing, etc.)
  - the streams created by system (tick)

  1. Create the pairs of raw streams and emitters (may be triggered by user interaction)
  2. Apply some simple transformation as required by business logics
  3. Assigns as whole object (central store of streams) to global 'window'
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
import { interval, merge } from 'rxjs'

import EventTypes from './event-types'
import { updateWorld, toggleCell, drawPattern } from './rules-of-life'
import { patterns } from './patterns'

import { streaming } from '../../utils/util-streaming'

// helper
const makeInitialWorld = patternName => {
  const pattern = patternName || 'QUEEN_BEE_SHUTTLE'
  const matrix = patterns[pattern.toUpperCase()] || []
  return drawPattern(40, 40, { matrix, col0: 5, row0: 5 })
}

/*
  define and pre-process needed streams
*/
;(function () {
  if (window.GameOfLifeStreams) return window.GameOfLifeStreams
  const TICK = 500

  // define event streams and related triggers
  const [toggleEvent$, toggleEmitter] = streaming()
  const [resetEvent$, resetEmitter] = streaming()
  const [activeEvent$, activateEmitter] = streaming()

  // define and preprocess streams
  const toggle$ = toggleEvent$.pipe(
    map(e => ({
      event_type: EventTypes.TOGGLE,
      event_payload: e.detail
    }))
  )

  const reset$ = resetEvent$.pipe(
    map(e => ({
      event_type: EventTypes.RESET
    }))
  )

  // transform the active stream for tracking and responding paused value if needed
  const active$ = activeEvent$.pipe(scan((active, event) => !active, true))

  const tick$ = interval(TICK).pipe(map(e => ({ event_type: EventTypes.TICK })))
  const activeTick$ = merge(tick$, activeEvent$).pipe(
    // scan to add 'active' field
    scan(
      (prev, e) => ({
        ...e,
        active: e.event_type === EventTypes.TICK ? prev.active : !prev.active
      }),
      { active: true }
    ),
    filter(e => e.active)
  )

  // transform events to functions (world update)
  //  ---f1---f2---f3---, function signature f: world -> world
  const toWorldUpdateFunc = e => {
    switch (e.event_type) {
      case EventTypes.TOGGLE: {
        const col = parseInt(e.event_payload.col)
        const row = parseInt(e.event_payload.row)
        return world => toggleCell(world, col, row)
      }
      case EventTypes.TICK:
        return world => updateWorld(world)
      case EventTypes.RESET: {
        return world => updateWorld(makeInitialWorld())
      }
      default:
        return world => world
    }
  }

  const worldFunc$ = merge(toggle$, reset$, activeTick$).pipe(
    map(toWorldUpdateFunc)
  )

  // make world stream with initial world
  const makeWorldStream = initialWorld =>
    worldFunc$.pipe(
      scan((world, f) => f(world), initialWorld) // scan as the world evolves ---world---world---
    )

  window.GameOfLifeStreams = {
    toggle: [toggle$, toggleEmitter],
    reset: [reset$, resetEmitter],
    active: [active$, activateEmitter],
    makeWorldStream,
    makeInitialWorld,
    EventTypes,
    TICK
  }
})()
