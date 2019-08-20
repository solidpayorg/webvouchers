// main
var UI = {}
UI.store = $rdf.graph()
UI.fetcher = new $rdf.Fetcher(UI.store)
UI.updater = new $rdf.UpdateManager(UI.store)

var subject = getQueryStringParam('uri') || 'https://melvincarvalho.com/#me'

class Tipjar extends React.Component {
  constructor (props) {
    super(props)

    this.state = { subject: subject }
  }

  fetchTipjar (subject) {
    UI.fetcher.load(subject).then(response => {
      let s = UI.store.sym(subject)
      let p = UI.store.sym('http://xmlns.com/foaf/0.1/tipjar')
      let o = null
      let w = UI.store.sym(subject.split('#')[0])
      let quads = UI.store.statementsMatching(s, p, o, w)
      this.setState({ quads: quads })
    }, err => {
      console.log(err)
    })
  }

  componentDidMount () {
    this.fetchTipjar(this.props.subject)
  }

  componentWillReceiveProps (props) {
    this.fetchTipjar(props.subject)
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
            <Tipjar />
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
        title='Tipjar App'
        sourceCode='https://github.com/play-grounds/react/blob/gh-pages/play/tipjar.html/' />
      <Body />

    </div>
  )
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
)
