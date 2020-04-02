// helper
import { patterns } from '../helpers/patterns'
import { drawPattern } from '../helpers/rules-of-life'

const TICK = 500
const COLS = 40
const ROWS = 40
const COL0 = 5
const ROW0 = 5
const pattern = 'QUEEN_BEE_SHUTTLE'

const makeInitialWorld = (cols, rows, col0, row0, pattern) => {
  const patternName = pattern || 'EMPTY'
  const matrix = patterns[patternName.toUpperCase()]
  return drawPattern(cols, rows, { matrix, col0, row0 })
}

const initialWorld = makeInitialWorld(COLS, ROWS, COL0, ROW0, pattern)

export default { initialWorld, pattern, TICK, COLS, ROWS, COL0, ROW0 }
