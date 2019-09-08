function Body (props) {
  return (
    <div>
      <h1 id='welcome' className='title'>
        Play apps!
      </h1>
    </div>
  )
}

function Li (props) {
  return (
    <span
      style={{
        display: 'flex',
        height: '200px',
        flexGrow: '1'
      }}
      className='box'
    >
      <div className='card'>
        <div className='card-content'>
          <div className='media'>
            <div className='media-left'>
              <div className='media-content'>
                <p className='title is-5'>
                  <a href={props.href}>{props.text}</a>
                </p>
                <hr />
              </div>
              <figure className='image is-48x48'>
                <img
                  src='https://bulma.io/images/placeholders/96x96.png'
                  alt='Placeholder image'
                />
                <div
                  style={{
                    display: 'inline',
                    verticalAlign: 'top',
                    paddingLeft: '10px'
                  }}
                  className='content'
                >
                  {props.description || props.text}
                </div>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </span>
  )
}

function App () {
  let apps = [
    {
      uri: 'bookmark.html',
      title: 'Bookmarks',
      description: 'Bookmarking App'
    },
    { uri: 'brain.html', title: 'Brain Wallet' },
    { uri: 'friends.html', title: 'Friends in RDF' },
    { uri: 'solid.html', title: 'Solid App' },
    { uri: 'rdflib.html', title: 'Test RDFLib' },
    { uri: 'tipjar.html', title: 'Tipjars' },
    { uri: 'localStorage.html', title: 'Local Storage' },
    { uri: 'bookmarklet.html', title: 'Bookmarklets' },
    { uri: 'solid-auth-client.html', title: 'Solid Auth Client' },
    { uri: 'wallet.html', title: 'Wallet' },
    { uri: 'credit.html', title: 'Credit' },
    { uri: 'outstated.html', title: 'Outstated Counter' },
    { uri: 'counter.html', title: 'Counter App' },
    { uri: 'seed.html', title: 'Seed App' },
    { uri: 'inbox.html', title: 'Inbox App' },
    { uri: 'patch.html', title: 'Patch App' },
    { uri: 'touch.html', title: 'Touch App' },
    { uri: 'put.html', title: 'Put App' },
    { uri: 'person.html', title: 'Profile App' },
    { uri: 'container.html', title: 'Container App' },
    { uri: 'timeline.html', title: 'Timeline App' },
    { uri: 'webtorrent.html', title: 'Webtorrent App' },
    { uri: 'dashboard.html', title: 'Dashboard App' },
    { uri: 'points.html', title: 'Points App' },
    {
      uri:
        'mind.html?data=%7B%22nodeData%22%3A%7B%22id%22%3A%22root%22%2C%22topic%22%3A%22Lightning%20games%22%2C%22root%22%3Atrue%2C%22children%22%3A%5B%7B%22topic%22%3A%22released%22%2C%22id%22%3A%22c63b8604ff228829%22%2C%22selected%22%3Atrue%2C%22new%22%3Atrue%2C%22children%22%3A%5B%7B%22topic%22%3A%22donner%20dungeon%22%2C%22id%22%3A%22c63b847b05a5686b%22%2C%22selected%22%3Atrue%2C%22new%22%3Atrue%7D%2C%7B%22topic%22%3A%22poker%22%2C%22id%22%3A%22c63b840e2e19d384%22%2C%22selected%22%3Atrue%2C%22new%22%3Atrue%7D%2C%7B%22topic%22%3A%22agar%22%2C%22id%22%3A%22c631c9cb1d7ff3cf%22%2C%22selected%22%3Atrue%2C%22new%22%3Atrue%2C%22style%22%3A%7B%22color%22%3A%22%23c0392c%22%7D%7D%5D%7D%2C%7B%22topic%22%3A%22coming%20soon%22%2C%22id%22%3A%22c63b869ec834af65%22%2C%22selected%22%3Atrue%2C%22new%22%3Atrue%2C%22children%22%3A%5B%7B%22topic%22%3A%22Infinite%20Fleet%22%2C%22id%22%3A%22c63b898f4420b806%22%2C%22selected%22%3Atrue%2C%22new%22%3Atrue%2C%22style%22%3A%7B%22fontSize%22%3A%2232%22%2C%22color%22%3A%22%2327ae61%22%2C%22fontWeight%22%3A%22bold%22%7D%7D%5D%7D%5D%2C%22expanded%22%3Atrue%2C%22style%22%3A%7B%22color%22%3A%22%23f1c40e%22%7D%7D%2C%22linkData%22%3A%7B%7D%7D',
      title: 'Mind Map App'
    },
    { uri: 'groupuris.html', title: 'Group URIs' },
    { uri: 'conference.html', title: 'Conference Call' },
    { uri: 'acl.html', title: 'ACL App' },
    { uri: 'webid.html', title: 'WebId App' },
    { uri: 'speech.html', title: 'Speech App' },
    { uri: 'calendar.html', title: 'Calendar App' },
    { uri: 'activity.html', title: 'Activity App' },
    { uri: 'voucher.html', title: 'Web Vouchers' }
  ]

  var appList = apps.map(app => {
    return <Li href={app.uri} text={app.title} description={app.description} />
  })

  return (
    <div>
      <NavbarSolidLogin
        className='is-link'
        title='Play Apps'
        sourceCode='https://github.com/play-grounds/react/blob/gh-pages/play/index.html'
      />
      <section style={{ maxWidth: '90%' }} className='section'>
        <Body />
        <hr />
        Play apps is a set of playground apps to test out various functionality.
        <br />
        Click on a link below to try out one of our apps.
        <hr />
        <div style={{ maxWidth: '90%', display: 'flex', flexWrap: 'wrap' }}>
          {appList}{' '}
        </div>
        <hr />
      </section>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
