import { h, customElement } from 'atomico'
import '../web-cell/web-cell'

const WebGrid = props => {
  const { arr, cols, rows } = props.world

  return (
    <host shadowDom style={style(cols, rows)}>
      {arr.map((val, idx) => {
        const row = Math.floor(idx / cols)
        const col = idx - row * cols
        return <web-cell key={idx} col={col} row={row} alive={val} />
      })}
    </host>
  )
}

WebGrid.props = {
  world: {
    type: Object,
    get value () {
      return { arr: [false], cols: 1, rows: 1 }
    }
  }
}

export default customElement('web-grid', WebGrid)

// Helpers CSS
const style = (cols, rows) => {
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