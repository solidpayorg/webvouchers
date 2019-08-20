// init
const defaultUri = 'https://melvincarvalho.com/#me'
var subject = getQueryStringParam('uri') || defaultUri

function Main(props) {
  return (
    <section className='section'>
      <AddressBar subject={subject}>
        <Person />
      </AddressBar>
    </section>
  )
}

function App() {
  return (
    <div>

      <NavbarSolidLogin
        className='is-link'
        title='Person'
        sourceCode='https://github.com/play-grounds/react/blob/gh-pages/play/person.html' />

      <Main />

    </div>
  )
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
)