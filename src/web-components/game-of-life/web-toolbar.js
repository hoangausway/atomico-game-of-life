import { h, customElement } from 'atomico'
const WebToolbar = props => {
  return (
    <host shadowDom>
      <button onClick={window.alert('reset')}>RESET</button>
      <button onClick={window.alert('pause')} active={props.active}>
        PAUSE
      </button>
    </host>
  )
}

WebToolbar.props = {
  active: Boolean
}

export default customElement('web-toolbar', WebToolbar)
