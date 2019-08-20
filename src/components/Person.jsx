//REMOVE import React from 'react' ; import Person from './Person.jsx'

var UI = {}
UI.store = $rdf.graph()
UI.fetcher = new $rdf.Fetcher(UI.store)
UI.updater = new $rdf.UpdateManager(UI.store)

const SIOC = $rdf.Namespace("http://rdfs.org/sioc/ns#")
const DCT = $rdf.Namespace('http://purl.org/dc/terms/')
const RDF = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/')
const VCARD = $rdf.Namespace('http://www.w3.org/2006/vcard/ns#')
const SOLID = $rdf.Namespace('http://www.w3.org/ns/solid/terms#')

function getVal(subject, predicate) {

  if (!subject || !predicate) return
  let s = UI.store.sym(subject)
  let p = predicate
  let o = null
  let w = UI.store.sym(subject.split('#')[0])
  let content = UI.store.any(s, p, o, w)
  if (content) {
    return content.value
  } else {
    return undefined
  }
}

function getTypeFromSubject(subject) {
  return getVal(subject, RDF('type'))
}

function getProfileFromSubject(subject) {
  var profile = {}
  profile.type = getVal(subject, RDF('type'))
  profile.name = getVal(subject, FOAF('name'))
  profile.nick = getVal(subject, FOAF('nick'))
  profile.img = getVal(subject, FOAF('img'))
  profile.image = getVal(subject, FOAF('image'))
  profile.depiction = getVal(subject, FOAF('depiction'))
  profile.hasPhoto = getVal(subject, VCARD('hasPhoto'))
  profile.fn = getVal(subject, VCARD('fn'))
  profile.nickname = getVal(subject, VCARD('nickname'))
  profile.timeline = getVal(subject, SOLID('timeline'))
  profile.publicTypeIndex = getVal(subject, SOLID('publicTypeIndex'))
  profile.privateTypeIndex = getVal(subject, SOLID('privateTypeIndex'))
  profile.subject = subject
  return profile
}


function getNameFromSubject(subject) {
  let profile = getProfileFromSubject(subject)
  let name = profile.name || profile.nick || profile.fn || subject
  return name
}

function getNickFromSubject(subject) {
  let profile = getProfileFromSubject(subject)
  let nick = profile.nickname || profile.nick
  return nick
}

function getAvatarFromSubject(subject) {
  let profile = getProfileFromSubject(subject)
  let avatar = profile.img || profile.image || profile.depiction || profile.hasPhoto
  return avatar
}

class Person extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 'subject': props.subject }
  }

  fetchProfile(subject) {
    console.log('fetchProfile', subject);
    if (!subject) return
    if (subject.match(/reddit.com.*this$/)) return

    UI.fetcher.load(subject).then(response => {
      console.log('fetched', subject)
      this.setState({ 'profile': getProfileFromSubject(subject) })
    })
  }

  getUpdatesVia(doc) {
    var linkHeaders = UI.store.fetcher.getHeader(doc, 'updates-via')
    if (!linkHeaders || !linkHeaders.length) return null
    return linkHeaders[0].trim()
  }

  setRefreshHandler(subject, handler) {
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

  refresh() {
    this.fetchProfile(this.state.subject)
  }

  componentDidMount() {
    let subject = this.state.subject
    this.fetchProfile(subject)
  }

  componentWillReceiveProps(props) {
    let subject = props.subject

    this.fetchProfile(subject)
  }

  render() {
    let profile = this.state.profile || {}
    let name = this.state.profile ? getNameFromSubject(this.state.subject) : 'has no name'
    let avatar = getAvatarFromSubject(this.state.subject) || 'https://bulma.io/images/placeholders/1280x960.png'
    let nick = getNickFromSubject(this.state.subject) || ''
    console.log('this.state.profile', this.state.profile)
    return (


      <div className="card">
        <div className="card-image">
          <figure className="image is-4by3">
            <img src={avatar} alt="Placeholder image" />
          </figure>
        </div>
        <div className="card-content">
          <div className="media">
            <div className="media-content">
              <p className="title is-4">{name}</p>
              <p className="subtitle is-6">@{nick}</p>
            </div>
          </div>

          <div className="content">
            <a href="#">#solid</a> <a href="#">#profile</a>
            <br />
          </div>

          <div className="content">
            <a target="_blank" href={'./timeline.html?uri=' + profile.timeline}>Timeline</a>
            <br />
          </div>



        </div>
      </div>
    )
  }
}
//REMOVE export default Person
