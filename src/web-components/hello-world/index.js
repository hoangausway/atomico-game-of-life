import { h, customElement } from 'atomico'
import Logo from './logo'
import style from './style.css'

function Hello ({ show }) {
  return (
    <host shadowDom>
      <style>{style}</style>
      <Logo color='white' />
      <h1>Hello Atomico</h1>
      <a href='https://github.com/atomicojs/atomico' target='_blank'>
        Documentation
      </a>
    </host>
  )
}

Hello.props = { show: Boolean }

export default customElement('hello-world', Hello)
