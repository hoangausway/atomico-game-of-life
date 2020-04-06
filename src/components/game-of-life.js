import { h, customElement } from 'atomico'
import { useState$, createEvent } from '../utils/utils'
import StreamsEmitters from '../context/streams-emitters'
import Params from '../context/params'

const GameOfLife = props => {
  const { initialWorld } = Params
  const [{ world$ }, { toggleEmit }] = StreamsEmitters
  const { arr, cols, rows } = useState$(world$, initialWorld)

  // render grids
  return (
    <host shadowDom>
      <style>{style(cols, rows)}</style>
      <div>
        {arr.map((alive, idx) => {
          const row = Math.floor(idx / cols)
          const col = idx - row * cols
          return (
            <div
              data-col={col}
              data-row={row}
              key={idx}
              style={cellStyle(alive)}
              onclick={e => toggleEmit(createEvent('toggle', e.target.dataset))}
            />
          )
        })}
      </div>
    </host>
  )
}

GameOfLife.props = {}

export default customElement('game-of-life', GameOfLife)

// Helpers - CSS
const style = (cols, rows) => `
:host {
  width: 100%;
  height: 100%;
}
:host > div {
  height: 100%;
  display: grid;
  grid-gap: 0px;
  grid-template-rows: repeat(${rows}, 1fr);
  grid-template-columns: repeat(${cols}, 1fr);
}
`
const cellStyle = alive => `
display: block;
cursor: pointer;
width: 100%;
height: 100%;
border: 1px solid lightgray;
background: ${alive ? 'MidnightBlue' : 'AliceBlue'};
`
