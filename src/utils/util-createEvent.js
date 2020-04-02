export const createEvent = (event, payload) =>
  new window.CustomEvent(event, { detail: payload })
