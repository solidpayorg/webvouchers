// REMOVE import React from 'react'

// Structure
// Bookmark
//   Person
// WebId
//   PublicTypeIndex
//     Bookmark instance
//       Bookmark File(s)

// init
var UI = {}
UI.store = $rdf.graph()
UI.fetcher = new $rdf.Fetcher(UI.store)
UI.updater = new $rdf.UpdateManager(UI.store)

// helpers
function getObject (subject, predicate) {
  if (!subject || !predicate) return
  let s = UI.store.sym(subject)
  let p = predicate
  let o = null
  let w = UI.store.sym(subject.split('#')[0])
  return UI.store.anyValue(s, p, o, w)
}

function getSubject (predicate, object) {
  if (!predicate || !object) return
  let s = null
  let p = predicate
  let o = UI.store.sym(object)
  let w = UI.store.sym(subject.split('#')[0])
  return UI.store.anyValue(s, p, o, w)
}

function getProfileFromUri (uri) {
  function g (p) {
    return getObject(uri, p)
  }
  return {
    '@id': uri,
    '@type': g(RDF('type')),
    type: g(RDF('type')),
    name: g(FOAF('name')),
    nick: g(FOAF('nick')),
    img: g(FOAF('img')),
    image: g(FOAF('image')),
    depiction: g(FOAF('depiction')),
    hasPhoto: g(VCARD('hasPhoto')),
    fn: g(VCARD('fn')),
    nickname: g(VCARD('nickname')),
    timeline: g(SOLID('timeline')),
    publicTypeIndex: g(SOLID('publicTypeIndex')),
    privateTypeIndex: g(SOLID('privateTypeIndex')),
    subject: uri
  }
}

function getBookmarkFromUri (uri) {
  function g (p) {
    return getObject(uri, p)
  }
  return {
    '@id': uri,
    '@type': g(RDF('type')),
    recalls: g(BOOK('recalls')) || 'lorem',
    title: g(DCT('title')) || 'lorem',
    maker: g(FOAF('maker')),
    created: g(DCT('created')),
    subject: uri
  }
}

function getTypeFromUri (uri) {
  function g (p) {
    return getObject(uri, p)
  }
  return g(RDF('type'))
}

function getBookmarkDocFromTypeIndex (uri) {
  if (!uri) return

  let typeRegistration = getSubject(SOLID('forClass'), BOOK('Bookmark'))
  if (typeRegistration) {
    return getObject(typeRegistration, SOLID('instance'))
  }
}

/**
 *  Bookmark or set of bookmarks
 */
class Bookmark extends React.Component {
  constructor (props) {
    // cogoToast.loading('Loading Bookmarks', {
    //   hideAfter: 3
    // })
    super(props)

    let hide = cogoToast.loading('Loading Bookmarks', {
      hideAfter: 0,
      onClick: hide => {
        hide()
      }
    })

    this.state = {
      subject: props.subject,
      bookmark: [
        {
          recalls: '',
          title: ''
        }
      ],
      person: {},
      hide: hide
    }
    this.hide = this.hide.bind(this)
  }

  fetchBookmark (subject, force) {
    force = !!force
    UI.fetcher.load(subject, { force: force }).then(
      response => {
        var type = getTypeFromUri(subject)
        var bm = []

        if (!type) {
          let s = UI.store.sym(subject)
          let p = UI.store.sym('http://purl.org/dc/terms/references')
          let subjects = UI.store.statementsMatching(s, p)
          for (let subject of subjects) {
            bm.push(getBookmarkFromUri(subject.object.value))
          }

          bm = bm.sort(function (a, b) {
            return b.created < a.created ? -1 : b.created > a.created ? 1 : 0
          })
        } else {
          bm.push(getBookmarkFromUri(subject))
        }

        for (const b of bm) {
          if (b.maker) {
            this.fetchPerson(b.maker)
          }
        }
        this.setState({ bookmark: bm })
        for (const i in bm) {
          let b = bm[i]
          let o = {}
          o[b.subject] = b
          this.setState(o)
        }
        this.hide()
      },
      err => {
        console.log(err)
      }
    )
  }

  hide () {
    this.state.hide()
  }

  fetchPerson (uri) {
    if (!uri) return
    if (uri.match(/reddit.com.*this$/)) {
      let o = {}
      o[uri] = { name: uri.replace(/.*reddit.com.*user.(.*).this/, '$1') }
      this.setState(o)
      return
    }

    UI.fetcher.load(uri).then(response => {
      let profile = getProfileFromUri(uri)

      let o = {}
      o[uri] = profile
      this.setState(o)
      if (uri === this.state.webId) {
        console.log('#### found WebId', profile.publicTypeIndex)
        this.fetchPublicTypeIndex(profile.publicTypeIndex)
      }
    })
  }

  fetchPublicTypeIndex (uri) {
    UI.fetcher.load(uri).then(response => {
      let bookmarkDoc = getBookmarkDocFromTypeIndex(uri)
      console.log('bookmarkDoc', bookmarkDoc, 'from', uri)
      let queryUri = new URLSearchParams(document.location.search).get('uri')
      if (bookmarkDoc) {
        console.log('this.props', this.props)
        if (bookmarkDoc && !queryUri && this.props.subject !== bookmarkDoc) {
          console.log(
            'setting subject to',
            bookmarkDoc,
            'from',
            this.props.subject
          )
          this.props.setState({ subject: bookmarkDoc })
        } else {
          console.log('subject unchanged', bookmarkDoc)
        }
      }
    })
  }

  getUpdatesVia (doc) {
    var linkHeaders = UI.store.fetcher.getHeader(doc, 'updates-via')
    if (!linkHeaders || !linkHeaders.length) return null
    return linkHeaders[0].trim()
  }

  setRefreshHandler (subject, handler) {
    var self = this
    var wss = this.getUpdatesVia(subject)
    let w = new WebSocket(wss)
    w.onmessage = function (m) {
      let data = m.data
      if (data.match(/pub .*/)) {
        // hack for now
        self.refresh()
      }
    }
    w.onopen = function () {
      w.send('sub ' + subject)
    }
  }

  refresh () {
    this.fetchBookmark(this.state.subject, true)
  }

  componentDidMount () {
    let subject = this.state.subject
    if (this.isMedia(subject) === false) {
      this.fetchBookmark(subject)
    }

    // check for WebId
    solid.auth.trackSession(session => {
      if (!session) console.log('The user is not logged in')
      else {
        console.log(`The user is ${session.webId}`)
        this.setState({ webId: session.webId })
        this.fetchPerson(session.webId)
      }
    })
  }

  componentWillReceiveProps (props) {
    let subject = props.subject
    if (this.isMedia(subject) === false) {
      this.fetchBookmark(subject)
    }
  }

  isMedia (subject) {
    // TODO better test for linked data
    let isMedia = false
    if (subject.match(/.ttl/)) {
      isMedia = false
    } else {
      isMedia = true
    }
    return isMedia
  }

  render () {
    let med = this.isMedia(this.props.subject)
    var self = this

    function getName (maker) {
      return self.state[maker] ? self.state[maker].name : maker
    }

    if (med === true) {
      return <Media href={this.props.subject} />
    } else {
      const listItems = this.state.bookmark.map((b, i) => (
        <div>
          <BookmarkItem
            key={i}
            id={i}
            recalls={b.recalls}
            title={b.title}
            maker={b.maker}
            name={getName(b.maker)}
            created={b.created}
            subject={b.subject}
          />
        </div>
      ))

      return <div>{listItems}</div>
    }
  }
}

/** Bookmark Item
 *
 * @param {} props
 */
function BookmarkItem (props) {
  const AUDIO_EXTENSIONS = /\.(m4a|mp4a|mpga|mp2|mp2a|mp3|m2a|m3a|wav|weba|aac|oga|spx)($|\?)/i
  const VIDEO_EXTENSIONS = /\.(mp4|og[gv]|webm|mov|m4v|mkv)($|\?)/i
  const IMAGE_EXTENSIONS = /\.(png|gif|bmp|svg|jpeg|jpg)($|\?)/i
  const URL = /http/i

  if (props.recalls.match(IMAGE_EXTENSIONS)) {
    return (
      <div className='box'>
        <table>
          <tbody>
            <tr>
              <td>{props.id + 1}.&nbsp;</td>
              <td>
                <a target='_blank' href={props.recalls}>
                  {props.title}
                </a>{' '}
                <a target='_blank' href={props.subject}>
                  <img height='10' width='10' src='./image/External.svg' />
                </a>
              </td>
            </tr>
            <tr>
              <td />
              <td>
                <sup style={{ color: 'rgb(136,136,136)' }}>
                  {moment.utc(props.created).fromNow()} by{' '}
                  <a
                    href={props.maker}
                    target='_blank'
                    style={{ color: '#369' }}
                  >
                    {props.name}
                  </a>
                </sup>
              </td>
            </tr>
            <tr>
              <td />
              <td>
                <img loading='lazy' src={props.recalls} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  } else if (props.recalls.match(VIDEO_EXTENSIONS)) {
    return (
      <div>
        {props.id + 1}.{' '}
        <video controls autoplay='true' loop src={props.recalls} />
      </div>
    )
  } else if (props.recalls.match(AUDIO_EXTENSIONS)) {
    return (
      <div>
        {props.id + 1}.{' '}
        <video controls autoplay='true' loop src={props.recalls} />
      </div>
    )
  } else if (props.recalls.match(URL)) {
    return (
      <div className='box'>
        <table>
          <tbody>
            <tr>
              <td>{props.id + 1}.&nbsp;</td>
              <td>
                <a target='_blank' href={props.recalls}>
                  {props.title}
                </a>{' '}
                <a target='_blank' href={props.subject}>
                  <img height='10' width='10' src='./image/External.svg' />
                </a>
              </td>
            </tr>
            <tr>
              <td />
              <td>
                <sup style={{ color: 'rgb(136,136,136)' }}>
                  {moment.utc(props.created).fromNow()} by{' '}
                  <a
                    href={props.maker}
                    target='_blank'
                    style={{ color: '#369' }}
                  >
                    {props.name}
                  </a>
                </sup>
              </td>{' '}
            </tr>
          </tbody>
        </table>
      </div>
    )
  } else {
    return (
      <div className='box'>
        <table>
          <tbody>
            <tr>
              <td>{props.id + 1}.&nbsp;</td>
              <td>
                <a target='_blank' href={props.recalls}>
                  {props.title}
                </a>{' '}
                <a target='_blank' href={props.subject}>
                  <img height='10' width='10' src='./image/External.svg' />
                </a>
              </td>
            </tr>
            <tr>
              <td />
              <td>
                <sup style={{ color: 'rgb(136,136,136)' }}>
                  {moment.utc(props.created).fromNow()} by{' '}
                  <a
                    href={props.maker}
                    target='_blank'
                    style={{ color: '#369' }}
                  >
                    {props.name}
                  </a>
                </sup>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

// REMOVE export default Bookmark
