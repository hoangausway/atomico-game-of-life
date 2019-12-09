import { merge, interval } from 'rxjs'
// eslint-disable-next-line
import { map, scan, filter, switchMap, tap } from 'rxjs/operators'

/*
  Streams Of Life:
  pause$
  toggle$
  tick$
*/

// event type constants
const WORLD_EVENT_RESET = 1
const WORLD_EVENT_ACTIVATE = 2
const WORLD_EVENT_TOGGLE = 3
const WORLD_EVENT_TICK = 4

export const WorldEventTypes = {
  RESET: WORLD_EVENT_RESET,
  ACTIVATE: WORLD_EVENT_ACTIVATE,
  TOGGLE: WORLD_EVENT_TOGGLE
}

// return stream of world events
export const makeWorldStream = (initialWorld, pause$, toggle$, reset$) => {
  const tick$ = reset$
    .pipe(switchMap(e => interval(e.world_event_reset.tick)))
    .pipe(map(e => ({ world_event_type: WORLD_EVENT_TICK })))

  const update$ = merge(reset$, toggle$, pause$, tick$).pipe(
    scan(
      (prev, e) => ({
        ...e,
        active:
          e.world_event_type === WORLD_EVENT_ACTIVATE
            ? !prev.active
            : prev.active
      }),
      { active: true }
    ),

    filter(
      e =>
        e.world_event_type === WORLD_EVENT_TOGGLE ||
        e.world_event_type === WORLD_EVENT_RESET ||
        (e.world_event_type === WORLD_EVENT_TICK && e.active)
    )
  )

  const updateWorldFunc$ = update$.pipe(
    map(e => {
      switch (e.world_event_type) {
        case WORLD_EVENT_TICK:
          return world => updateWorld(world)
        case WORLD_EVENT_TOGGLE: {
          const [col, row] = e.world_event_cell
          return world => toggleCell(world, col, row)
        }
        case WORLD_EVENT_RESET: {
          return world => updateWorld(e.world_event_reset.world)
        }
        default:
      }
    })
  )

  return updateWorldFunc$.pipe(scan((world, f) => f(world), initialWorld))
}

/* draw the named pattern in the world at (col0, row0) */
export function drawPattern (rows, cols, pattern) {
  const { matrix, col0, row0 } = pattern

  /* make a copy of world to modify */
  const arr = Array(rows * cols).fill(false)

  /* update each cell according to the pattern */
  let x, y
  for (y = 0; y < matrix.length; y++) {
    for (x = 0; x < matrix[0].length; x++) {
      /* check that we are still within the bounds of the world */
      if (row0 + y < rows && col0 + x < cols) {
        arr[(row0 + y) * cols + col0 + x] = matrix[y][x] === 1
      }
    }
  }

  return { arr, rows, cols }
}

/* Helpers - Rules */
/*
  Rules: In a grid, a cell may be live or dead (black or white).
  Grid is started with some live cells and then be evolving over time (ticks).
  At each moment, each cell is examined to change it's status.
  Depends on it's current status and it's neighbours' statuses the examined cell
  may stay at current status or move to new status.
  Examine a cell, let's call N as number of live neighbours (8 of them)
  - If N = 2, examined cell stay as dead or live
  - If N = 3, examined cell should move to live
  - Else (N < 2 or N > 3), examined cell should move to dead

  API of logics:
  - updateWorld(world)
  - toggleCell(world, x, y)
  - drawPattern(rows, cols, pattern)
*/
/* return new world with updated state of all cells based on the previous state of the world */
function updateWorld (world) {
  const { arr, rows, cols } = world

  /* make a copy of world to modify */
  const newArr = arr.slice()

  /* update each cell */
  let x, y
  for (y = 0; y < rows; y++) {
    for (x = 0; x < cols; x++) {
      newArr[y * cols + x] = updateCellState(x, y, world)
    }
  }

  return { arr: newArr, rows, cols }
}

/* return the world with the (x, y) cell state toggled */
function toggleCell (world, x, y) {
  const { arr, rows, cols } = world

  /* make a copy of world to modify */
  const newArr = arr.slice()
  newArr[y * cols + x] = !arr[y * cols + x]
  return { arr: newArr, rows, cols }
}

/* check whether the cell at these indices exists and is alive */
function isAlive (x, y, world) {
  const { arr, rows, cols } = world
  return x >= 0 && y >= 0 && x < cols && y < rows && arr[y * cols + x]
}

/* return an int that represents the number of live neighbours around this cell */
function getNumLiveNeighbours (x, y, world) {
  let total = 0

  // cell has neighbour(s) below
  total += isAlive(x, y + 1, world)

  // cell has neighbour below left
  total += isAlive(x - 1, y + 1, world)

  // cell has neighbour below right
  total += isAlive(x + 1, y + 1, world)

  // cell has neighbour(s) above
  total += isAlive(x, y - 1, world)

  // cell has neighbour above left
  total += isAlive(x - 1, y - 1, world)

  // cell has neighbour above right
  total += isAlive(x + 1, y - 1, world)

  // cell has neighbour(s) left
  total += isAlive(x - 1, y, world)

  // cell has neighbour(s) right
  total += isAlive(x + 1, y, world)

  return total
}

/* return the state of the cell in the current world according to the following rules:
 * - any live cell with fewer than two live neighbours in the most
 * recent environment state dies, as if caused by under-population
 * - any live cell with more than three live neighbours in the most
 * recent environment state dies, as if by overcrowding
 * - any dead cell with exactly three live neighbours in the most
 * recent environment state becomes a live cell, as if by reproduction
 */
function updateCellState (x, y, world) {
  /* find the number of live neighbours of the cell */
  const numLiveNeighbours = getNumLiveNeighbours(x, y, world)

  /* return the new state of the cell if it is changing */
  if (numLiveNeighbours < 2 || numLiveNeighbours > 3) {
    return false
  } else if (numLiveNeighbours === 3) {
    return true
  }

  /* otherwise, return the same state of the cell */
  return world.arr[y * world.cols + x]
}
