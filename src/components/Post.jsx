//REMOVE import React from 'react'
//REMOVE import Media from './Media.jsx'

var UI = {}
UI.store = $rdf.graph()
UI.fetcher = new $rdf.Fetcher(UI.store)
UI.updater = new $rdf.UpdateManager(UI.store)

const SIOC = $rdf.Namespace("http://rdfs.org/sioc/ns#")
const DCT = $rdf.Namespace('http://purl.org/dc/terms/')
const RDF = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/')
const SOLID = $rdf.Namespace('http://www.w3.org/ns/solid/terms#')
const VCARD = $rdf.Namespace('http://www.w3.org/2006/vcard/ns#')

function PostItem(props) {
  const AUDIO_EXTENSIONS = /\.(m4a|mp4a|mpga|mp2|mp2a|mp3|m2a|m3a|wav|weba|aac|oga|spx)($|\?)/i
  const VIDEO_EXTENSIONS = /\.(mp4|og[gv]|webm|mov|m4v|mkv)($|\?)/i
  const IMAGE_EXTENSIONS = /\.(png|gif|bmp|svg|jpeg|jpg)($|\?)/i
  const URL = /http/i


  if (props.content.match(IMAGE_EXTENSIONS)) {
    return (
      <div>
            <img src={getAvatarFromSubject(props.maker)} style={{ 'margin' : '1px', 'borderRadius' : '50%', 'height' : '40px', 'width' : '40px' }} width="40" height="40" />&nbsp;
            
              <sup  style={{ color : '#ADB2BB', 'verticalAlign' : 'top' }}>
              
              <a style={{ 'fontWeight' : 'bold' }} href={props.maker} target="_blank">{getNameFromSubject(props.maker)}</a> &nbsp;
              
                {moment.utc(props.created).fromNow()} &nbsp; <a target="_blank" href={props.subject}><img height="10" width="10" src="./image/External.svg" /></a> </sup>
              <br/>
              <span style={{ 'fontFamily' : 'Helvetica', 'fontSize': '14px'}}>  <a target="_blank" href={props.content}>{props.content}</a> </span>
              <img src={props.content} />
              
            <hr/>


      </div>      
        )
  } else if (props.content.match(VIDEO_EXTENSIONS)) {
    return (
      <div>{props.id + 1}. <video controls autoplay='true' loop src={props.content} /></div>)
  } else if (props.content.match(AUDIO_EXTENSIONS)) {
    return (
      <div>{props.id + 1}. <video controls autoplay='true' loop src={props.content} /></div>)
    } else if (props.content.match(URL)) {
      return (
        <div>
          <table>
            <tbody>
              <tr>
                <td>{props.id + 1}.&nbsp;</td>
                <td><a target="_blank" href={props.content}>{props.content}</a> <a target="_blank" href={props.subject}><img height="10" width="10" src="./image/External.svg" /></a></td>
              </tr>
              <tr>
                <td></td>
                <td><sup>{moment.utc(props.created).fromNow()} by <a href={props.maker} target="_blank" style={{ color : 'inherit' }}>{props.maker}</a></sup></td>
              </tr>
  
            </tbody>
          </table>
  
        </div>
      )
      } else {
    return (
      <div>
            <img src={getAvatarFromSubject(props.maker)} style={{ 'margin' : '1px', 'borderRadius' : '50%', 'height' : '40px', 'width' : '40px' }} width="40" height="40" />&nbsp;
            
              <sup  style={{ color : '#ADB2BB', 'verticalAlign' : 'top' }}>
              
              <a style={{ 'fontWeight' : 'bold' }} href={props.maker} target="_blank">{getNameFromSubject(props.maker)}</a> &nbsp;
              
                {moment.utc(props.created).fromNow()} &nbsp; <a target="_blank" href={props.subject}><img height="10" width="10" src="./image/External.svg" /></a> </sup>
              <br/>
              <span style={{ 'fontFamily' : 'Helvetica', 'fontSize': '14px'}}>  {props.content} </span>
            <hr/>


      </div>
    )
  }
}

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
  let name = profile.name || profile.nick || subject
  return name
}

function getAvatarFromSubject(subject) {
  let profile = getProfileFromSubject(subject)
  let avatar = profile.img || profile.image || profile.depiction
  return avatar
}

class Post extends React.Component {
  constructor(props) {
    super(props)
    let media = this.isMedia(props.subject)
    this.state = { 'subject': props.subject, post: [{ 'content': '' }] }
  }

  getPostFromSubject(subject) {
    
    //console.log('getPostFromSubject', subject)
  
    let content = getVal(subject, SIOC('content'))
    let maker = getVal(subject, DCT('creator'))
    let created = getVal(subject, DCT('created'))
    //console.log('getPostFromSubject', maker)
    
    this.fetchProfile(maker)
  
    let post = { 'content': content, 'maker' : maker, 'created' : created, 'subject' : subject }
    return post
  }
  
  fetchProfile(subject) {
    console.log('fetchProfile', subject);
    if (!subject) return
    if (subject.match(/reddit.com.*this$/)) return
  
    UI.fetcher.load(subject ).then(response => {
      console.log('fetched', subject)      
    })
  }
      

  fetchPost(subject, force) {
    force = !! force
    // hack to force fetcher
    UI.fetcher.load(subject, {'force' : force} ).then(response => {
      var type = getTypeFromSubject(subject)
      var posts = []

      if (!type || type == 'http://www.w3.org/ns/iana/media-types/text/turtle#Resource') {
        let s = UI.store.sym(subject)
        let p = DCT('references')
        let subjects = UI.store.statementsMatching(s, p)
        for (let subject of subjects) {
          posts.push(this.getPostFromSubject(subject.object.value))
        }

        posts = posts.sort( function(a,b) { 
          return (b.created < a.created) ? -1 : ((b.created > a.created) ? 1 : 0);
        } )

        this.setState({ 'post': posts })

      } else {
        posts.push(this.getPostFromSubject(subject))

        this.setState({ 'post': posts })
      }
    }, err => {
      console.log(err)
    })
  }

  getUpdatesVia (doc) {
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
    this.fetchPost(this.state.subject)
  }

  componentDidMount() {
    let subject = this.state.subject
    if (this.isMedia(subject) === false) {
      this.fetchPost(subject)
      setTimeout(() => (this.fetchPost(subject)), 1500)
    }
    if (subject) {
      setTimeout(() => {
        this.setRefreshHandler (subject, this.refresh)         
      }, 1000);
    }
  }

  componentWillReceiveProps(props) {
    let subject = props.subject
    if (this.isMedia(subject) === false) {
      this.fetchPost(subject)
    }
  }

  isMedia(subject) {
    // TODO better test for linked data
    let isMedia = false
    if (subject.match(/.ttl/) || subject.match('#this') ) {
      isMedia = false
    } else {
      isMedia = true
    }
    return isMedia
  }

  render() {
    let med = this.isMedia(this.props.subject)

    if (med === true) {
      return (
        <Media href={this.props.subject} />
      )
    } else {
      const listItems = this.state.post.map((b, i) =>
        <div>
          <PostItem key={i} id={i} content={b.content} maker={b.maker} created={b.created} subject={b.subject}/>
        </div>
      )

      return (
        <div>{listItems}</div>
      )
    }
  }
}
//REMOVE export default Post
