var UI = {}
UI.store = $rdf.graph()
UI.fetcher = new $rdf.Fetcher(UI.store)
UI.updater = new $rdf.UpdateManager(UI.store)

class App extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      message: '',
      request:
        new URLSearchParams(document.location.search).get('request') || '',
      uri:
        new URLSearchParams(document.location.search).get('uri') ||
        'https://localhost:8888/',
      destination:
        new URLSearchParams(document.location.search).get('destination') || '',
      voucher:
        new URLSearchParams(document.location.search).get('voucher') || '',
      amount: new URLSearchParams(document.location.search).get('amount') || 0
    }
    this.changeAmount = this.changeAmount.bind(this)
    this.changeRequest = this.changeRequest.bind(this)
    this.changeDestination = this.changeDestination.bind(this)
    this.changeUri = this.changeUri.bind(this)
    this.changeVoucher = this.changeVoucher.bind(this)
    this.send = this.send.bind(this)

    solid.auth.trackSession(session => {
      if (!session) {
        this.setState({ message: 'The user is not logged in' })
      } else {
        if (session.webId) {
          this.setState({
            message: `User : ${session.webId}`,
            user: session.webId
          })
          this.getProfile(session.webId)
        }
      }
    })
  }

  getProfile (profile) {
    console.log('fetching', profile)
    UI.fetcher.load(profile, { force: true }).then(response => {
      let s = UI.store.sym(profile)
      let p = UI.store.sym('http://www.w3.org/ns/solid/terms#publicTypeIndex')
      let o = null
      let w = UI.store.sym(profile.split('#')[0])
      let uri = UI.store.any(s, p, o, w)
      // this.setState({'uri' : uri.value})
    })
  }

  send () {
    console.log('sending', this.state)
    let body = 'request=' + this.state.request
    body += '&amount=' + this.state.amount
    body += '&destination=' + this.state.destination
    body += '&voucher=' + this.state.voucher
    solid.auth.fetch(this.state.uri, {
      body: body,
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST'
    })
  }

  changeAmount (event) {
    this.setState({ amount: event.target.value })
  }

  changeDestination (event) {
    this.setState({ destination: event.target.value })
  }

  changeRequest (event) {
    this.setState({ request: event.target.value })
  }

  changeUri (event) {
    this.setState({ uri: event.target.value })
  }

  changeVoucher (event) {
    this.setState({ voucher: event.target.value })
  }

  async popupLogin (event) {
    login('https://solid.community/common/popup.html')
  }

  render () {
    let href = window.location.href.split('?')[0]
    href += '?uri=' + encodeURIComponent(this.state.uri)
    if (this.state.request) {
      href += '&request=' + encodeURIComponent(this.state.request)
    }
    if (this.state.destination) {
      href += '&destination=' + encodeURIComponent(this.state.destination)
    }
    if (this.state.amount) {
      href += '&amount=' + encodeURIComponent(this.state.amount)
    }
    if (this.state.voucher) {
      href += '&voucher=' + encodeURIComponent(this.state.voucher)
    }
    history.pushState({}, 'App', href)

    return (
      <div>
        <NavbarSolidLogin
          className='is-link'
          title='Web Voucher'
          sourceCode='https://github.com/play-grounds/react/blob/gh-pages/play/voucher.html'
        />
        <section className='section'>
          <h2>Web Vouchers</h2>
          <hr />
          {this.state.message}
          <hr />
          Voucher URI (optional) :
          <br />
          <br />
          <input
            style={{ width: '95%' }}
            value={this.state.voucher}
            onChange={this.changeVoucher}
          />
          <hr />
          Server URI : <br />
          <input
            style={{ width: '95%' }}
            onChange={this.changeUri}
            value={this.state.uri}
          />
          <a href={this.state.uri} target='_blank'>
            {' '}
            <img height='10' width='10' src='./image/External.svg' />
          </a>{' '}
          <hr />
          Payment Request :
          <br />
          <br />
          <textarea
            style={{ width: '95%' }}
            value={this.state.request}
            onChange={this.changeRequest}
          />
          <hr />
          Destination URI (optional) :
          <br />
          <br />
          <input
            style={{ width: '95%' }}
            value={this.state.destination}
            onChange={this.changeDestination}
          />
          <hr />
          Amount (optional) :
          <br />
          <br />
          <input
            style={{ width: '95%' }}
            value={this.state.amount}
            onChange={this.changeAmount}
          />
          <hr />
          Command : <br />
          fetch("{this.state.uri}",{' '}
          {"{ mode : 'no-cors', headers : { 'Content-Type', 'application/x-www-form-urlencoded' }, body : 'request=" +
            this.state.request +
            '&voucher=' +
            this.state.voucher +
            '&amount=' +
            this.state.amount +
            '&destination=' +
            this.state.destination +
            "', 'method' : 'POST' } "}{' '}
          )
          <hr />
          Curl : <br />
          curl{' '}
          {"-X POST --cert $CERT --key $CERT -H  'Content-Type : application/x-www-form-urlencoded' --data 'request=" +
            this.state.request +
            '&voucher=' +
            this.state.voucher +
            '&amount=' +
            this.state.amount +
            '&destination=' +
            this.state.destination +
            "'  "}{' '}
          '{this.state.uri}'
          <hr />
          <div className='buttons'>
            <button
              className='button is-success'
              onClick={this.send}
              target='_blank'
            >
              Pay!
            </button>
          </div>
          <hr />
        </section>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
