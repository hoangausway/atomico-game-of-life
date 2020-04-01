# The Conway's Game Of Life using Atomico and RxJS - `<game-of-life>`

## Subjects

- Web component, Atomico, RxJS
- Build Conway's Game Of Life  with Atomico and RxJS

## To show
- Define a web component without class (Atomico way, likes modern React)
- Taste Functional Reactive Programming (RxJS) with Atomico

For basic examples please see:

- [`<web-cell>`:  Simple web component example using Atomico](https://github.com/hoangausway/atomico-simple-web-cell)

- [`<web-grid>`: Simple web component example using Atomico](https://github.com/hoangausway/atomico-simple-web-grid)

- [`<random-flip>`: A simple "game" exploring web components web-cell and web-grid](https://github.com/hoangausway/atomico-random-flip)

## Source - Build - Run
- Web compoenent `<game-of-life>`.
- Web compoenent `<web-toolbar>`.
- Central store of streams (RxJS Subject)

- Commands to install, build, watch and run:

```bash
npm install # install dependencies
npm run dev # build and watch for code changes and open the localserver: 8080
```

## Component's logics
**`<game-of-life>`**

**Quick description**

- Grid of "alive" and "dead" cells
- In each iteration of the game (a "tick"), cells become dead or alive based on the previous state of the neighbourhood:
  - **underpopulation:** any live cell with < 2 live neighbours dies
  - **overpopulation:** any live cell with > 3 live neighbours dies
  - **reproduction:** any dead cell with exactly 3 live neighbours becomes a live cell

**Links**

The description of Conway's Game Of Life: [https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life]

A good source introducing Reactive Programming/RxJs/Game Of Life: [https://docs.google.com/presentation/d/e/2PACX-1vQ06TaoEe3o9Xu7FluNigjqaKwXreoPj4xYgZ-ZCAw4cXlMSPpEqAH0re11eP2_uzw7N_hpEZ33gWsG/pub?start=false&loop=false&delayms=3000&slide=id.g34fa86e976_0_0]

## Takeaways
**How RxJS works with Atomico**

**Engage DOM event with RxJS stream
```bash
/src/web-components/gol-streams/gol-streams.js

import { Subject } from 'rxjs'

# makes an event stream with Subject which will be triggered by event emitter
const streamEmitter = () => {
  const eventStream$ = new Subject()
  const eventEmitter = e => eventStream$.next(e)
  return [eventStream$, eventEmitter]
}
```

Usage of streamEmitter:

```bash
/src/web-components/gol-streams/gol-streams.js
...
# define event streams and related triggers
const [toggleEvent$, toggleEmit] = streamEmitter()
const [resetEvent$, resetEmit] = streamEmitter()
const [activeEvent$, activateEmit] = streamEmitter()
...
```
**Subscribe/unsubscribe streams as side effects in useEffect block**
```bash
/src/web-components/game-of-life/game-of-life.js
import { useEffect } from 'atomico'
...
useEffect(() => {
  const worldSub = world$.subscribe(setWorld)
  return () =>  worldSub.unsubscribe()
}, [])
```

**Emit stream**
```bash
/src/web-components/game-of-life/game-of-life.js
...
# emits `cell_toggle` event using `toggleEmit`
const clickHandler = e =>
    toggleEmit(
      new window.CustomEvent('cell_toggle', { detail: {col, row} })
    )
```

## What's next
Improve `<game-of-life>` from some aspects.  It's nice to add a web component playing "control panel" role, which allows user to change tick's duration, to apply initial world pattern from predefined list of famous patterns.

Or, we could accumulate some interesting statistic data (for example, max/min number of life cells).