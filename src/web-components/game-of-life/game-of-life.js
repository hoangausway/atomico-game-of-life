import { h, customElement, useState, useEffect } from 'atomico'
import streamsOfLife from './streamsOfLife'

const createCustomEvent = (event, detail) => {
  return new window.CustomEvent(event, { detail })
}

const GameOfLife = props => {
  const { initialWorld, tick, active } = props

  // state: world
  const [world, setWorld] = useState(initialWorld)
  const { arr, cols, rows } = world

  //  state: cellToggle
  const [cellToggle, setCellToggle] = useState(null)

  // interested streams and emitters
  const {
    streams: { world$, active$, reset$ },
    emitters: { toggleEmitter, resetEmitter, activateEmitter }
  } = streamsOfLife({
    active,
    tick,
    initialWorld
  })

  // subscribe and unsubscribe streams accordingly
  useEffect(() => {
    const worldSub = world$.subscribe(setWorld)
    const activeSub = active$.subscribe(active =>
      console.log(`Active? ${active}`)
    )
    const resetSub = reset$.subscribe(e => console.log('RESET'))

    return () => {
      worldSub.unsubscribe()
      activeSub.unsubscribe()
      resetSub.unsubscribe()
    }
    // eslint-disable-next-line
  }, [])

  // emits 'cell_toggle' event
  useEffect(() => {
    if (cellToggle) {
      toggleEmitter(createCustomEvent('cell_toggle', cellToggle))
    }
  }, [cellToggle])

  // emits 'reset' event
  useEffect(() => {
    if (initialWorld) {
      setWorld(initialWorld)
      resetEmitter(
        createCustomEvent('reset', { world: initialWorld, tick })
      )
    }
  }, [initialWorld, tick])

  // emits 'activate' event
  useEffect(() => {
    activateEmitter(createCustomEvent('active_toggle'))
  }, [active])

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
            onclick={e => setCellToggle(e.target.dataset)}
          />
        )
      })}
    </host>
  )
}

GameOfLife.props = {
  initialWorld: {
    type: Object,
    get value () {
      return { arr: [] }
    }
  },
  tick: {
    type: Number,
    get value () {
      return 100
    }
  },
  active: {
    type: Boolean,
    get value () {
      return false
    }
  }
}

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
