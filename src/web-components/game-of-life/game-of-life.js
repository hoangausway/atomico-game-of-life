import { h, customElement, useState, useEffect } from 'atomico'

import useEventOfLife from './useEventOfLife'
import '../web-grid/web-grid'

const GameOfLife = props => {
  const { initialWorld, tick, active } = props

  const resetEvent = {
    world_event_reset: {
      world: initialWorld,
      tick: tick
    }
  }

  const togglePauseEvent = new window.CustomEvent('togglepause')

  // states: world
  const [world, setWorld] = useState(initialWorld)

  // observer which will update world state
  const worldObserver = setWorld

  // [optional] observers tracking events 'reset' and 'pause'
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

  // whenever 'initialWorld' or 'tick' props changed, emit resetEvent
  useEffect(
    () => {
      if (initialWorld !== undefined) {
        setWorld(initialWorld)
        resetEmit(resetEvent)
      }
    },
    [initialWorld, tick]
  )

  // whenever 'active' prop changed, emit togglePauseEvent
  useEffect(
    () => {
      pauseEmit(togglePauseEvent)
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
