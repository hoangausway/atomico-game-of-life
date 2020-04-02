export default (event, payload) =>
  new window.CustomEvent(event, { detail: payload })
