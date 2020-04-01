import { h, customElement, useState, useEffect } from 'atomico'
import { useState$ } from '../../utils/util-useState$'

const createEvent = (event, detail) =>
  new window.CustomEvent('cell_toggle', { detail })

/*
  Props:
  Render: grid of cells
  Events: click [cell]
*/
const GameOfLife = props => {
  // stream store
  const {
    toggle: [_, toggleEmitter],
    makeWorldStream,
    makeInitialWorld
  } = window.GameOfLifeStreams

  // interested world stream with an initial world
  const initialWorld = makeInitialWorld()
  const world$ = makeWorldStream(initialWorld)
  const { arr, cols, rows } = useState$(world$, initialWorld)

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
              toggleEmitter(createEvent('cell_toggle', e.target.dataset))
            }
          />
        )
      })}
    </host>
  )
}

GameOfLife.props = {}

export default customElement('game-of-life', GameOfLife)

// Helpers - Utils

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
