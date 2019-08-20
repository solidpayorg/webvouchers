// init
const defaultUri = 'https://i.redd.it/gwctsj9lbs731.jpg'
var subject = getQueryStringParam('uri') || defaultUri

function Main (props) {
  return (
    <section className='section'>
      <AddressBar subject={subject}>
        <Post />
      </AddressBar>
    </section>
  )
}

function App () {
  return (
    <div>

      <NavbarSolidLogin
        className='is-link'
        title='Post'
        sourceCode='https://github.com/play-grounds/react/blob/gh-pages/play/post.html' />

      <Main />

    </div>
  )
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
)