import { h, customElement, useState, useEffect } from 'atomico'

import useEventOfLife from './useEventOfLife'
import '../web-grid/web-grid'

const GameOfLife = props => {
  const { initialWorld, tick, active } = props

  // states: world
  const [world, setWorld] = useState(initialWorld)

  // observers which will update states
  const worldObserver = setWorld
  const activeObserver = active => console.log(`Is paused? ${!active}`)
  const resetObserver = e => console.log('RESET - observed')

  /*
    wrapper of business logics of the game of life
    return a set of handlers/emitter which can be used to raise/trigger events
    from inside the wrapper, the observers will be called as events happen
  */
  const [resetEmit, activeEmit, toggleEmit] = useEventOfLife(
    [worldObserver, activeObserver, resetObserver],
    initialWorld,
    tick
  )

  useEffect(
    () => {
      if (initialWorld && tick) {
        setWorld(initialWorld)
        resetEmit(
          new window.CustomEvent('reset', {
            detail: { tick, world: initialWorld }
          })
        )
      }
    },
    [initialWorld, tick]
  )

  useEffect(
    () => {
      activeEmit(new window.CustomEvent('active_toggle'))
    },
    [active]
  )

  return (
    <host shadowDom ontogglecell={toggleEmit}>
      <web-grid world={world} />
    </host>
  )
}

GameOfLife.props = {
  initialWorld: {
    type: Object,
    get value () {
      return null
    }
  },
  tick: {
    type: Number,
    get value () {
      return 1000
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
