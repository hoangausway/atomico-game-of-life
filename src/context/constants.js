// helper
import { patterns } from '../helpers/patterns'
import { drawPattern } from '../helpers/rules-of-life'

const TICK = 500
const COLS = 40
const ROWS = 40
const COL0 = 5
const ROW0 = 5

const makeInitialWorld = (cols, rows, col0, row0, patternName) => {
  const pattern = patternName || 'QUEEN_BEE_SHUTTLE'
  const matrix = patterns[pattern.toUpperCase()] || []
  return drawPattern(cols, rows, { matrix, col0, row0 })
}

const initialWorld = makeInitialWorld(COLS, ROWS, COL0, ROW0)

if (!window.GOLAppConstants) {
  window.GOLAppConstants = { TICK, COLS, ROWS, COL0, ROW0, initialWorld }
}
