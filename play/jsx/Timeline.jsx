// main
var UI = {}
UI.store = $rdf.graph()
UI.store.fetcher = new $rdf.Fetcher(UI.store)
UI.updater = new $rdf.UpdateManager(UI.store)

var subject = new URLSearchParams(document.location.search).get('uri')
  || 'https://melvin.solid.live/public/timeline/'
var view = new URLSearchParams(document.location.search).get('view') || 'default'


window.onpopstate = function (event) {
  console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));
  location.reload()
};

function fetchResource(subject) {
  UI.store.fetcher.load(subject).then(response => {
  }, err => {
    console.log(err)
  })
}

class Resource extends React.Component {
  constructor(props) {
    super(props)
    let view = new URLSearchParams(document.location.search).get('view')
    this.handleClick = this.handleClick.bind(this)
  }

  componentDidMount() {
    UI.store.fetcher.load(UI.store.sym(this.props.subject)).then(response => {
      this.setState({ subject: this.props.subject })
    }, err => {
      console.log(err)
    })
  }

  handleClick(event) {
  }


  render() {
    return (
      <div><a target="_blank" href={'./post.html?uri=' + this.props.name + 'index.ttl'}>{this.props.name}</a></div>
    )
  }
}



class Timeline extends React.Component {
  constructor(props) {
    super(props)

    this.state = { subject: subject }
  }

  fetchCointainer(subject) {
    UI.store.fetcher.load(subject).then(response => {
      let s = UI.store.sym(subject)
      let p = UI.store.sym('http://www.w3.org/ns/ldp#contains')
      let o = null
      let w = UI.store.sym(subject.split('#')[0])
      let quads = UI.store.statementsMatching(s, p, o, w)
      console.log(quads)
      this.setState({ quads: quads })
    }, err => {
      console.log(err)
    })
  }

  componentDidMount() {
    this.fetchCointainer(this.props.subject)
  }

  componentWillReceiveProps(props) {
    this.fetchCointainer(props.subject)
  }

  render() {
    if (this.state.quads) {
      var filtered = this.state.quads.filter((r) => { if (r.object.value.match(/[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]\/$/)) return true })
      var friendSet = filtered.map((quad) => {
        return <Resource subject={quad.object.value} name={quad.object.value} />
      })
    }

    return (
      <div>
        <ul>{friendSet}</ul>
      </div>
    )
  }
}

function Body(props) {
  return (
    <div>

      <div>
        <section className='section'>
          <AddressBar subject={subject}
            view={new URLSearchParams(document.location.search).get('view')}>
            <Timeline />
          </AddressBar>
        </section>

      </div>

    </div>
  )
}

function App() {
  return (
    <div>
      <NavbarSolidLogin
        className='is-link'
        title='Timeline App'
        sourceCode='https://github.com/play-grounds/react/blob/gh-pages/play/timeline.html/' />
      <Body />

    </div>
  )
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
)
