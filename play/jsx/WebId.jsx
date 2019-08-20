async function login (idp) {
  const session = await solid.auth.currentSession()
  if (!session) {
    await solid.auth.login(idp)
  } else {
    console.log(`Logged in as ${session.webId}`)
  }
}

async function popupLogin (idp) {
  const session = await solid.auth.currentSession()
  if (!session) await solid.auth.popupLogin(idp)
  else console.log(`Logged in as ${session.webId}`)
}

/** Checks syncronously whether user is logged in
 *
 * @returns Named Node or null
 */
function currentUser () {
  let str = localStorage['solid-auth-client']
  if (str) {
    let da = JSON.parse(str)
    if (da.session && da.session.webId) {
      // @@ check has not expired
      return $rdf.sym(da.session.webId)
    }
  }
  return offlineTestID() // null unless testing
}

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      message: ''
    }
    this.handleChange = this.handleChange.bind(this)

    solid.auth.trackSession(session => {
      if (!session) {
        this.setState({ message: 'The user is not logged in' })
      } else {
        this.setState({ message: `The user is ${session.webId}` })
      }
    })
  }

  async handleChange (event) {
    login('https://solid.community')
  }

  async popupLogin (event) {
    login('https://solid.community/common/popup.html')
  }

  render () {
    return (
      <div>
        <NavbarSolidLogin
          className='is-link'
          title='WebId'
          sourceCode='https://github.com/play-grounds/react/blob/gh-pages/play/webid.html'
        />
        <section className='section'>
          <h1 id='welcome' className='title'>
            WebId
          </h1>
          <hr />
          Info :{' '}
          <a href='https://www.w3.org/2005/Incubator/webid/spec/'>Specs</a>
          <hr />
          {this.state.message}
          <hr />
          <div className='buttons'>
            <button className='button is-link' onClick={this.handleChange}>
              Login
            </button>
            <button className='button is-info' onClick={this.popupLogin}>
              Popup Login
            </button>
            <button
              className='button is-primary'
              onClick={() => {
                localStorage.clear()
                location.reload()
              }}
            >
              Logout
            </button>
            <button
              className='button is-warning'
              onClick={() => {
                var sac = JSON.parse(localStorage.getItem('solid-auth-client'))
                console.table(sac)
                console.table(sac.rpConfig)
                console.table(sac.session)
                console.table(sac.session.authorization)
                console.table(sac.session.idClaims)
              }}
            >
              Debug Console
            </button>
            <a
              className='button is-success'
              target='_blank'
              href='https://solid.github.io/solid-idps/'
            >
              Sign Up for Solid
            </a>
          </div>
          <hr />
        </section>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
