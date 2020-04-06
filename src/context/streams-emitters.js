/*
  Exports
  - The streams which play role of state for view components.
  - The associated 'emit' functions which will trigger streams' transition

  In general, there're 2 groups of streams:
  - the streams triggered by user interaction (click, typing, etc.)
  - the streams created by system (tick)

  Codes:
  1. Create the pairs of raw streams and triggers (may be triggered by user interaction)
  2. Apply some simple transformations as required by business logics
  3. Web components can access the streams amd emitters as neccessary.
     They can subscribe to streams or use them for further transformations.

  In this particular application, we will consider the following streams (and associated emitters):
  - stream of cell toggling events, triggered when user clicks on a cell in the grid
  - stream of 'reset' event, triggered when user clicks on some [RESET] button
  - stream of 'pause/activate' event, triggered when user clicks button [PAUSE/CONTINUE]
  - stream of ticks, which will automatically update grid based on 'rule-of-life' logics
    (this stream is triggered by background 'tick'
  - and the compound stream, named world$, reflects effects of all above streams

  NOTES:
  - All transformations in this module are pure functions
  - The components which use these streams will subscribe/unsubscribe them as side effects
*/

// eslint-disable-next-line
import { filter, map, scan, startWith, switchMap, tap } from 'rxjs/operators'
import { interval, merge } from 'rxjs'

import EventTypes from '../helpers/event-types'
import { updateWorld, toggleCell } from '../helpers/rules-of-life'

import { streaming } from '../utils/utils'
import Params from '../context/params'

/*
  define and pre-process needed streams
*/
const { initialWorld, TICK } = Params

// define event streams and related triggers
const [toggleEvent$, toggleEmit] = streaming()
const [resetEvent$, resetEmit] = streaming()
const [activeEvent$, activateEmit] = streaming()

// define and preprocess streams
const toggle$ = toggleEvent$.pipe(
  map(e => ({
    event_type: EventTypes.TOGGLE,
    event_payload: e.detail
  }))
)

const reset$ = resetEvent$.pipe(
  map(e => ({
    event_type: EventTypes.RESET,
    event_payload: initialWorld
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
const worldUpdateFunc = e => {
  switch (e.event_type) {
    case EventTypes.TOGGLE: {
      const col = parseInt(e.event_payload.col)
      const row = parseInt(e.event_payload.row)
      return world => toggleCell(world, col, row)
    }
    case EventTypes.TICK:
      return world => updateWorld(world)
    case EventTypes.RESET: {
      return world => updateWorld(e.event_payload)
    }
    default:
      return world => world
  }
}

//  ---f1---f2---f3---, function's signature f: world -> world
const worldFunc$ = merge(toggle$, reset$, activeTick$).pipe(
  map(worldUpdateFunc)
)

// make compound world stream which evolves from initial world
// ---w---w--w-------
const world$ = worldFunc$.pipe(
  scan((world, f) => f(world), initialWorld)
)

// exports [streams, emitters]
export default [
  { world$, toggle$, reset$, active$ },
  { toggleEmit, resetEmit, activateEmit }
]
