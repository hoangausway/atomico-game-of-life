import { h, customElement, useEvent } from 'atomico'

const WebCell = props => {
  const dispatchToggleCell = useEvent('togglecell', {
    composed: true,
    bubbles: true
  })

  return (
    <host
      shadowDom
      onclick={e => dispatchToggleCell(props)}
      style={getStyle(props.live)}
    />
  )
}

WebCell.props = {
  live: Boolean,
  col: Number,
  row: Number
}

export default customElement('web-cell', WebCell)

// Helpers CSS
const getStyle = live => {
  return {
    display: 'block',
    cursor: 'pointer',
    width: '100%',
    height: '100%',
    border: '1px solid gray',
    background: live ? 'MidnightBlue' : 'AliceBlue'
  }
}
