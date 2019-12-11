# The Conway's Game Of Life using Atomico and RxJS - `<game-of-life>`

## Subjects

- Web component, Atomico, RxJS
- Build Conway's Game Of Life  with Atomico and RxJS

## To show
- Define a web component without class (Atomico way, likes modern React)
- Using 'props' to set properties to web component (Atomico way, some 'yes' and 'no')
- Using dispatch mechanism to raise event from web component to outside world
- Taste Functional Reactive Programming (RxJS) with Atomico

For basic cases please see:

- [`<web-cell>`:  Simple web component example using Atomico](https://github.com/hoangausway/atomico-simple-web-cell)

- [`<web-grid>`: Simple web component example using Atomico](https://github.com/hoangausway/atomico-simple-web-grid)

- [`<random-flip>`: A simple "game" exploring web components web-cell and web-grid](https://github.com/hoangausway/atomico-random-flip)

## Source - Build - Run

- The project structure is based on the **Hello World** example of Atomico author. The component `<hello-world>` is kept for reference in case it's needed.
- Added `<web-cell>` component.
- Added `<web-grid>` component.
- Added `<game-of-life>` component.
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

**Engage DOM event with RxJS stream using Atomico useMemo/useCallback**
```bash
/src/web-components/game-of-life/useEventStream.js

import { useMemo } from 'atomico'
import { Subject } from 'rxjs'

export const useEventStream = (dependencies = []) => {
  const eventStream$ = useMemo(() => new Subject(), dependencies)
  const eventEmit = e => eventStream$.next(e)
  # useCallback maybe OK here:
  # const eventEmit = useCallback(e => eventStream$.next(e), dependencies)
  # at the writing moment the useCallback not available yet.
  return [eventEmit, eventStream$]
}
```

Usage of useEventStream:

```bash
/src/web-components/game-of-life/useEventOfLife.js
import { useEventStream } from './useEventStream'
import { map } from 'rxjs/operators'
...
# define event streams and related triggers
const [toggleEmit, toggleEvent$] = useEventStream()
const [pauseEmit, pauseEvent$] = useEventStream()
const [resetEmit, resetEvent$] = useEventStream()
...
# manipulating pauseEvent$ stream
const pause$ = pauseEvent$.pipe(
  map(e => ({ ...e, world_event_type: WorldEventTypes.ACTIVATE }))
)

...
```
**Emit stream within useEffect**
```bash
/src/web-components/game-of-life/game-of-life.js
import { useEffect } from 'atomico'
...
# emits `pause` event using `pauseEmit`
useEffect(
  () => {
    pauseEmit(new window.CustomEvent('pause'))
  },
  [active]
)
```
**Subscribe/unsubscribe stream within useEffect**
```bash
/src/web-components/game-of-life/useEventOfLife.js
import { useEffect } from 'atomico'
...
useEffect(() => {
  ...
  const pauseSub = pauseStream$.subscribe(pauseObserver)
  return () => {
    ...
    pauseSub.unsubscribe()
  }
}, [])
```


## What's next
Improve `<game-of-life>` from some aspects.  It's nice to add a web component playing "control panel" role, which allows user to change tick's duration, to apply initial world pattern from predefined list of famous patterns.

Or, we could accumulate some interesting statistic data (for example, max/min number of life cells).