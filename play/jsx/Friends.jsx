// main
var UI = {}
UI.store = $rdf.graph()
UI.store.fetcher = new $rdf.Fetcher(UI.store)
UI.updater = new $rdf.UpdateManager(UI.store)

var subject = new URLSearchParams(document.location.search).get('uri')
  || 'https://melvincarvalho.com/#me'
var view = new URLSearchParams(document.location.search).get('view')
  || 'filter'

window.onpopstate = function (event) {
  console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));
  location.reload()
};

function fetchPerson(subject) {
  UI.store.fetcher.load(subject).then(response => {
  }, err => {
    console.log(err)
  })
}

var avatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTAwIDEwMCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+PGc+PGc+PGc+PHBhdGggZD0iTTQ3LjY4Niw1MC44MDloMC4zOTFjLTAuMTA4LTAuMDktMC4yMTMtMC4xNzMtMC4zMDctMC4yNzJjLTMuMDk5LTIuNzk5LTUuNDYzLTguMjM5LTUuNDYzLTEyLjYzNyAgICAgIGMwLTYuMjIyLDUuMDk0LTEwLjMxNSw5LjkxMS0xMC4zMTVjNC44MTMsMCw5LjY1MSw0LjQyOCw5LjY1MSwxMC42NDdjMCw0LjM5Ni0yLjYxNSw5LjY3MS01Ljg1MSwxMi4zNzQgICAgICBjMC42NjUsMi41MzYsNC4zMDYsMy4zNjYsMTEuODE1LDUuNDI1YzguMzQzLDIuMjksNi45MDcsNy45NTgsNi44ODIsMTEuNzY0SDI5LjY4NGMtMC4wMjYtMy44MDYtMi4wOTMtOS40NzQsNi4yNTEtMTEuNzY0ICAgICAgQzQzLjIzOCw1NC4wMjYsNDYuODc2LDUzLjE4NSw0Ny42ODYsNTAuODA5eiI+PC9wYXRoPjxwYXRoIGQ9Ik00OC4wNzcsNTAuODA5aC0wLjM5MWMwLjAzMi0wLjA5LDAuMDU3LTAuMTc3LDAuMDgzLTAuMjcyQzQ3Ljg2Myw1MC42MzYsNDcuOTY5LDUwLjcxOSw0OC4wNzcsNTAuODA5eiI+PC9wYXRoPjwvZz48L2c+PC9nPjwvZz48L3N2Zz4='

class Person extends React.Component {
  constructor(props) {
    super(props)
    let view = new URLSearchParams(document.location.search).get('view')
    this.state = { name: props.subject, img: avatar, view: props.view }
    this.handleClick = this.handleClick.bind(this)
  }

  componentDidMount() {
    UI.store.fetcher.load(UI.store.sym(this.props.subject)).then(response => {
      let name = UI.store.any(UI.store.sym(this.props.subject), UI.store.sym('http://xmlns.com/foaf/0.1/name')) ||
        UI.store.any(UI.store.sym(this.props.subject), UI.store.sym('http://www.w3.org/2006/vcard/ns#fn'))
      let img = UI.store.any(UI.store.sym(this.props.subject), UI.store.sym('http://xmlns.com/foaf/0.1/img')) ||
        UI.store.any(UI.store.sym(this.props.subject), UI.store.sym('http://xmlns.com/foaf/0.1/depiction')) ||
        UI.store.any(UI.store.sym(this.props.subject), UI.store.sym('http://www.w3.org/2006/vcard/ns#hasPhoto'))
      img = img ? img.value : this.props.subject.value
      name = name ? name.value : avatar
      this.setState({ 'name': name, 'img': img })
    }, err => {
      console.log(err)
    })
  }

  handleClick(event) {
    let webId = event.target.title
    let href = window.location.href.split('?')[0]
    href += '?uri=' + encodeURIComponent(webId)
    href += '&view='
    href += this.state.view ? this.state.view : view
    history.pushState({}, 'Friends App', href)
    console.log(webId)
    window.location.reload()
  }


  render() {
    function handleRemove(event) {
    }

    const filterView = (
      <div style={{ 'display': 'flex' }}>
        <img src={this.state.img} width='50' height='50'
          style={{ 'margin': 1, borderRadius: '50%', height: '50px' }} />
        <a style={{ 'flexGrow': 1, 'margin': 'auto 0' }}
          title={this.props.subject} onClick={this.handleClick} >{
            this.state.name}
        </a>
        <a href={this.props.subject} target='_blank'
          style={{ 'margin': '5px' }} >
          <img src='https://solid.github.io/solid-ui/src/originalIcons/go-to-this.png' />
        </a>
      </div>
    )

    const groupView = (
      <div style={{ 'display': 'flex' }}>
        <img src={this.state.img} width='50' height='50'
          style={{ 'margin': 1, borderRadius: '50%' }} />
        <a href={this.props.subject} target='_blank'
          style={{ 'flexGrow': 1, 'margin': 'auto 0' }} >{this.state.name}</a>
        <button style={{ 'margin': '5px', 'height': '50px' }} onClick={handleRemove} >Remove</button>
      </div>
    )

    const rosterView = (
      <div style={{ 'display': 'flex' }}>
        <img src={this.state.img} width='50' height='50'
          style={{ 'margin': 1, borderRadius: '50%', 'height': '50px' }} />
        <a style={{ 'flexGrow': 1, 'margin': 'auto 0' }} title={this.props.subject} onClick={this.handleClick} >{this.state.name}</a>
        <a href={this.props.subject} target='_blank' style={{ 'margin': '5px' }} >
          <img src='https://solid.github.io/solid-ui/src/originalIcons/go-to-this.png' />
        </a>
      </div>

    )

    var views = {}
    views.filter = filterView
    views.group = groupView
    views.roster = rosterView

    let view = new URLSearchParams(document.location.search).get('view') || 'filter'

    if (view === 'group') {
      return (
        views.group
      )
    } else if (view === 'roster') {
      return (
        views.roster
      )
    } else if (view === 'filter') {
      return (
        this.state.name.match(/http/) ?
          <span></span> : !this.state.img ?
            <span></span> : views.roster
      )
    }
  }
}



class Roster extends React.Component {
  constructor(props) {
    super(props)

    this.state = { subject: subject }
  }

  fetchFriends(subject) {
    UI.store.fetcher.load(subject).then(response => {
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

  componentDidMount() {
    this.fetchFriends(this.props.subject)
  }

  componentWillReceiveProps(props) {
    this.fetchFriends(props.subject)
  }

  render() {
    if (this.state.quads) {
      var friendSet = this.state.quads.map((quad) => {
        return <Person subject={quad.object.value} name={quad.object.value} />
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
          <Addressbar subject={subject}
            view={new URLSearchParams(document.location.search).get('view')}>
            <Roster />
          </Addressbar>
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
        title='Friends App'
        sourceCode='https://github.com/play-grounds/react/blob/gh-pages/play/friends.html/' />
      <Body />

    </div>
  )
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
)
