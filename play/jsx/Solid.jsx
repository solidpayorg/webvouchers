// main
var UI = {}
UI.store = $rdf.graph()
UI.fetcher = new $rdf.Fetcher(UI.store)
UI.updater = new $rdf.UpdateManager(UI.store)

// refresh on change
let uri = location.href
let wss = uri.replace('http', 'ws')
let touchUri = uri
let w = new WebSocket(wss)
w.onmessage = function (m) {
  let data = m.data
  console.log('data', data)
  if (data.match(/pub .*/)) {
    location.reload()
  }
}
w.onopen = function () {
  w.send('sub ' + touchUri)
}


var subject = getQueryStringParam('uri') || 'https://melvincarvalho.com/#me'

class Solid extends React.Component {
  constructor (props) {
    super(props)

    this.state = { subject: subject }
  }

  fetchFriends (subject) {
    UI.fetcher.load(subject).then(response => {
      let s = UI.store.sym(subject)
      let p = UI.store.sym('http://xmlns.com/foaf/0.1/knows')
      let o = null
      let w = UI.store.sym(subject.split('#')[0])
      let quads = UI.store.statementsMatching(s, p, o, w)
      this.setState({ quads: quads })
    }, err => {
      console.log(err)
    })
  }

  componentDidMount () {
    this.fetchFriends(this.props.subject)
  }

  componentWillReceiveProps (props) {
    this.fetchFriends(props.subject)
  }

  render () {
    return (
      <div>
        <NamedNodeSet nodes={this.state.quads} subject={this.props.subject} />
      </div>
    )
  }
}

function Body (props) {
  return (
    <div>

      <div>
        <section className='section'>
          <Addressbar subject={subject}>
            <Solid />
          </Addressbar>
        </section>

      </div>

    </div>
  )
}

function App () {
  return (
    <div>
      <NavbarSolidLogin
        className='is-link'
        title='Solid App'
        sourceCode='https://github.com/play-grounds/react/blob/gh-pages/play/solid.html/' />
      <Body />

    </div>
  )
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
)
