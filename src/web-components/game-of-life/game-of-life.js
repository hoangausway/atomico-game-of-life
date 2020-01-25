import { h, customElement, useState, useEffect } from 'atomico'
import { makeStreamsOfLife, makeInitialWorld } from './world-stream'

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

  // interested world stream with default initialWorld
  const initialWorld = makeInitialWorld()
  const world$ = makeStreamsOfLife(toggle$, reset$, activeTick$, initialWorld)

  // states: world, cellToggle
  const [{ arr, cols, rows }, setWorld] = useState(initialWorld)
  const clickHandler = e =>
    toggleEmitter(
      new window.CustomEvent('cell_toggle', { detail: e.target.dataset })
    )

  // subscribe and unsubscribe streams accordingly
  useEffect(() => {
    const worldSub = world$.subscribe(setWorld)
    return () => worldSub.unsubscribe()
  }, [])

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
