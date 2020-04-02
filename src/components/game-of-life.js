import { h, customElement } from 'atomico'
import { useState$ } from '../utils/util-useState$'
import streaming from '../context/streaming'
import { createEvent } from '../utils/util-createEvent'

/*
  Props:
  Render: grid of cells
  Events: click [cell]
*/
const GameOfLife = props => {
  const { initialWorld } = window.GOLAppConstants
  const [{ world$ }, { toggleEmit }] = streaming
  const world = useState$(world$, initialWorld)
  const { arr, cols, rows } = world

  // render grids
  return (
    <host shadowDom style={gridStyle(cols, rows)}>
      {arr.map((alive, idx) => {
        const row = Math.floor(idx / cols)
        const col = idx - row * cols
        return (
          <div
            data-col={col}
            data-row={row}
            key={idx}
            style={cellStyle(alive)}
            onclick={e =>
              toggleEmit(createEvent('cell_toggle', e.target.dataset))
            }
          />
        )
      })}
    </host>
  )
}

GameOfLife.props = {}

export default customElement('game-of-life', GameOfLife)

// Helpers - CSS
const gridStyle = (cols, rows) => {
  return {
    width: '100%',
    height: '100%',
    display: 'grid',
    'grid-gap': '0px',
    'grid-template-columns': `repeat(${cols}, 1fr)`,
    'grid-template-rows': `repeat(${rows}, 1fr)`,
    border: '1px solid #fafafa'
  }
}

const cellStyle = alive => {
  return {
    display: 'block',
    cursor: 'pointer',
    width: '100%',
    height: '100%',
    border: '1px solid gray',
    background: alive ? 'MidnightBlue' : 'AliceBlue'
  }
}