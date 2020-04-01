import { h, customElement } from 'atomico'
import { useState$ } from '../../utils/util-useState$'

const WebToolbar = () => {
  const {
    reset: [_, resetEmit], // reset$ not used
    active: [active$, activateEmit]
  } = window.GameOfLifeStreams

  // an variable to track 'active' state of button [PAUSE]
  const active = useState$(active$, true)

  return (
    <host shadowDom style={toolbarStyle()}>
      <button onclick={resetEmit} style={resetStyle()}>
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
