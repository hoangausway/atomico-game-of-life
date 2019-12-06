# The Conway's Game Of Life using Atomico and RxJS - `<game-of-life>`

## Subjects

- Web component, Atomico, RxJS
- Build Conway's Game Of Life  with Atomico and RxJS

## To show
- Define a web component without class (Atomico way, likes modern React)
- Using 'props' to set properties to web component (Atomico way, some 'yes' and 'no')
- Using dispatch mechanism to raise event from web component to outside world
- Taste Functional Reactive Programming (RxJS) with Atomico

## Source - Build - Run

- The project structure is based on the **Hello World** example of Atomico author. The component `<hello-world>` is kept for reference in case it's needed.
- Added `<web-cell>` component.
- Added `<web-grid>` component.
- Added `<game-of-life>` component.
- Commands to install, build, watch and run:

```bash
npm install # install dependencies
npm run dev # build and watch for code changes
npm run server # run dev server at port 8080
```

## Component's logics
**`<game-of-life>`**

The description of Conway's Game Of Life: [https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life]

A good source introducing Reactive Programming/RxJs/Game Of Life: [https://docs.google.com/presentation/d/e/2PACX-1vQ06TaoEe3o9Xu7FluNigjqaKwXreoPj4xYgZ-ZCAw4cXlMSPpEqAH0re11eP2_uzw7N_hpEZ33gWsG/pub?start=false&loop=false&delayms=3000&slide=id.g34fa86e976_0_0]

**TBD**

## Takeaways
**How RxJS works with Atomico**

**TBD: more details**

## What's next
Improve `<game-of-life>` from some aspects.  It's nice to add a web component playing "control panel" role, which allows user to change tick's duration, to apply initial world pattern from predefined list of famous patterns.

Or, we could accumulate some interesting statistic data (for example, max/min number of life cells).