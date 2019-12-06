import { h, customElement, useProp, useEvent } from 'atomico'
import '../web-cell'

const WebGrid = props => {
  const [world] = useProp('world')

  const dispatchWorlChange = useEvent('worldchange', {
    bubles: true,
    composed: true
  })

  const handleToggleCell = e => {
    const { col, row } = e.detail
    dispatchWorlChange({ world, col, row })
  }

  return (
    <host
      shadowDom
      style={style(world.cols, world.rows)}
      ontogglecell={handleToggleCell}
    >
      {world.arr.map((val, idx) => {
        const row = Math.floor(idx / world.cols)
        const col = idx - row * world.cols
        return <web-cell key={idx} col={col} row={row} live={val} />
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
