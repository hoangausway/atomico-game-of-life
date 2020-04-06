import { h, customElement } from 'atomico'
import { useState$, createEvent } from '../utils/utils'
import StreamsEmitters from '../context/streams-emitters'
import Params from '../context/params'

const AToolbar = () => {
  const { initialWorld } = Params

  const [{ active$ }, { activateEmit, resetEmit }] = StreamsEmitters

  const resetEvent = createEvent('reset', initialWorld)

  // an variable to track 'active' state of button [PAUSE]
  const active = useState$(active$, true)

  return (
    <host shadowDom>
      <style>{style(active)}</style>
      <div>
        <button id='reset' onclick={e => resetEmit(resetEvent)}>
          RESET
        </button>
        <button id='pause' onclick={activateEmit}>
          {active ? 'PAUSE' : 'CONTINUE'}
        </button>
        <span className='text'>
          {Params.pattern}, <strong>Tick:</strong> {Params.TICK}ms,{' '}
          <strong>Grid:</strong> {Params.COLS}x{Params.ROWS}
        </span>
      </div>
    </host>
  )
}

export default customElement('a-toolbar', AToolbar)

// Helpers - CSS
const style = active => `
:host {
  width: 100%;
}
:host > div {
  margin-bottom: 6px;
}
button {
  width: 120px;
  height: 32px;
  border-radius: 5px;
  text-decoration: none;
  font-size: 0.8rem;
  color: white;
}
#reset {
  background-color: navy;
}
#pause {
  margin-left: 10px;
  background-color: ${active ? 'darkred' : 'green'};  
}
.text {
  font-size: 0.7rem;
  margin-left: 10px;
}
`
