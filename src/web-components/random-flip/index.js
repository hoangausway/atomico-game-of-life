import { h, customElement, useRef, useEffect, useProp, useEvent } from 'atomico'
import '../web-grid'

const RandomFlip = props => {
  const [initialWorld] = useProp('initialWorld')
  const [tick] = useProp('tick')
  const [active] = useProp('active')

  const ref = useRef()

  const dispatchDone = useEvent('done', { bubles: true, composed: true })
  const { cols, rows } = initialWorld

  useEffect(
    () => {
      const timer = setInterval(() => {
        if (active) {
          randomFlipCell(ref, dispatchDone, cols, rows)
        }
      }, tick)
      return () => clearInterval(timer)
    },
    [active]
  )

  return (
    <host
      shadowDom
      ref={ref}
      onworldchange={handleWorldChange(ref, dispatchDone)}
    >
      <web-grid world={initialWorld} />
    </host>
  )
}

RandomFlip.props = {
  initialWorld: {
    type: Object,
    get value () {
      return { arr: [false], cols: 1, rows: 1 }
    }
  },
  tick: {
    type: Number,
    get value () {
      return 1000
    }
  },
  active: {
    type: Boolean,
    get value () {
      return false
    }
  }
}

export default customElement('random-flip', RandomFlip)

/*  Helpers */
// transform the world by toggling state of the cell at (col, row)
const toggleCell = ({ world, col, row }) => {
  const { arr, cols, rows } = world
  const newArr = arr.slice()
  newArr[row * cols + col] = !arr[row * cols + col]
  return { arr: newArr, rows: rows, cols: cols }
}

// is world done?
const isDone = world => {
  const { rows, cols, arr } = world
  const sum = arr.reduce((prev, cur) => (cur ? prev + 1 : prev), 0)
  return !!(sum === 0 || sum === rows * cols)
}

// get the web-grid component (the only one)
const getWebGrid = ref => ref.current.shadowRoot.children[0]

// handle 'worldchange' event: a cell needs toggle
// if done after change, raise 'done' event
const handleWorldChange = (ref, dispatchDone) => e => {
  const webGrid = getWebGrid(ref)
  webGrid.world = toggleCell(e.detail)
  if (isDone(webGrid.world)) dispatchDone()
}

// random pick a cell and raise 'worldchange' event
const randomFlipCell = (ref, dispatchDone, cols, rows) => {
  const col = Math.floor(Math.random() * cols)
  const row = Math.floor(Math.random() * rows)
  const world = getWebGrid(ref).world
  const e = new window.CustomEvent('worldchange', {
    detail: { world, col, row }
  })

  handleWorldChange(ref, dispatchDone)(e)
}
