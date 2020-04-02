import { h, customElement } from 'atomico'
import { useState$ } from '../utils/util-useState$'
import streaming from '../context/streaming'
import { createEvent } from '../utils/util-createEvent'

const WebToolbar = () => {
  const { initialWorld } = window.GOLAppConstants

  const [{ active$ }, { activateEmit, resetEmit }] = streaming

  const resetEvent = createEvent('reset', initialWorld)

  // an variable to track 'active' state of button [PAUSE]
  const active = useState$(active$, true)

  return (
    <host shadowDom style={toolbarStyle()}>
      <button onclick={e => resetEmit(resetEvent)} style={resetStyle()}>
        RESET
      </button>
      <button onclick={activateEmit} style={pauseStyle(active)}>
        {active ? 'PAUSE' : 'CONTINUE'}
      </button>
    </host>
  )
}

export default customElement('web-toolbar', WebToolbar)

// Helpers - CSS
const toolbarStyle = () => ({
  width: '100%'
})

const buttonStyle = () => ({
  width: '120px',
  height: '32px',
  margin: '20px 0px 0px 20px',
  'border-radius': '5px',
  'text-decoration': 'none',
  'font-size': '0.8rem',
  'padding-top': '4px',
  color: 'white'
})

const resetStyle = () => {
  const btnStyle = buttonStyle()
  return {
    ...btnStyle,
    'background-color': 'navy'
  }
}

const pauseStyle = active => {
  const btnStyle = buttonStyle()
  return {
    ...btnStyle,
    'background-color': active ? 'darkred' : 'green'
  }
}
