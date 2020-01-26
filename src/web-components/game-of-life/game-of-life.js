import { h, customElement, useState, useEffect } from 'atomico'
import { makeStreamsOfLife, makeInitialWorld } from './world-stream'

/*
  return 'state' value from stream 'state$'
*/
const useState$ = (state$, initialState) => {
  // setup state for current comopnent
  const [state, setState] = useState(initialState)
  useEffect(() => {
    const sub = state$.subscribe(setState)
    return () => sub.unsubscribe()
  }, [])

  return state
}

/*
  Props:
  Render: grid of cells
  Events: click [cell]
*/
const GameOfLife = props => {
  // stream store
  const {
    toggle: [toggle$, toggleEmitter],
    reset: [reset$],
    activeTick: [activeTick$]
  } = window.GameOfLifeStreams

  // interested world stream with an initial world
  const initialWorld = makeInitialWorld()
  const world$ = makeStreamsOfLife(toggle$, reset$, activeTick$, initialWorld)
  const { arr, cols, rows } = useState$(world$, initialWorld)

  const clickHandler = e =>
    toggleEmitter(
      new window.CustomEvent('cell_toggle', { detail: e.target.dataset })
    )

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
            onclick={clickHandler}
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
