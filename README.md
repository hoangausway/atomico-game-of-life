# The Conway's Game Of Life using Atomico and RxJS - `<game-of-life>`

## Subjects
- Web component, Atomico, RxJS
- Build Conway's Game Of Life  with Atomico and RxJS

## To show
- Define a web component without class (Atomico way, likes modern React)
- Taste Reactive Programming (RxJS) with Atomico

For basic example please see:
- [atomico-rxjs-try1](https://github.com/hoangausway/atomico-rxjs-try1)

## Source - Build - Run
- Web component `<game-of-life>`.
- Web component `<web-toolbar>`.
- Streams (RxJS Subject) and triggers in `streams-emitters.js`

- Commands to install, build, watch and run:
```bash
npm i # install dependencies
npm run dev # build and watch for code changes
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

## What's next
Improve `<game-of-life>` from some aspects.  It's nice to add a web component playing "control panel" role, which allows user to change tick's duration, to apply initial world pattern from predefined list of famous patterns.

Or, we could accumulate some interesting statistic data (for example, max/min number of life cells).