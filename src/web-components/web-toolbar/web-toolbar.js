import { h, customElement, useEffect, useState } from 'atomico'

const WebToolbar = () => {
  const {
    reset: [reset$, resetEmitter],
    active: [active$, activateEmitter]
  } = window.StreamStore

  const [active, setActive] = useState(true)
  useEffect(() => {
    const resetSub = reset$.subscribe(console.log)
    const activeSub = active$.subscribe(setActive)
    return () => {
      resetSub.unsubscribe()
      activeSub.unsubscribe()
    }
  }, [])

  return (
    <host shadowDom style={toolbarStyle()}>
      <button onclick={resetEmitter} style={resetStyle()}>
        RESET
      </button>
      <button onclick={activateEmitter} style={pauseStyle(active)}>
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
