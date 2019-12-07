import { h, customElement, useState, useEffect } from 'atomico'

import useEventOfLife from './useEventOfLife'
import '../web-grid'

const GameOfLife = props => {
  const { initialWorld, tick, active } = props

  const resetEvent = {
    world_event_reset: {
      world: initialWorld,
      tick: tick
    }
  }

  const pauseEvent = () => new window.CustomEvent('pause')

  // states: world
  const [world, setWorld] = useState(initialWorld)

  // observers which will update states
  const worldObserver = setWorld
  const pauseObserver = paused => console.log(`Is paused? ${!paused}`)
  const resetObserver = e => console.log('RESET')

  /*
    wrapper of business logics of the game of life
    return a set of handlers/emitter which can be used to raise/trigger events
    from inside the wrapper, the observers will be called as events happen
  */
  const [resetEmit, pauseEmit, toggleEmit] = useEventOfLife(
    [worldObserver, pauseObserver, resetObserver],
    initialWorld,
    resetEvent
  )

  useEffect(
    () => {
      if (initialWorld) {
        setWorld(initialWorld)
        resetEmit(resetEvent)
      }
    },
    [initialWorld]
  )

  useEffect(() => pauseEmit(pauseEvent()), [active])

  return (
    <host shadowDom ontogglecell={toggleEmit}>
      <web-grid world={world} />
    </host>
  )
}

GameOfLife.props = {
  initialWorld: Object,
  tick: {
    type: Number,
    get value () {
      return 1000
    }
  },
  active: Boolean
}

export default customElement('game-of-life', GameOfLife)
