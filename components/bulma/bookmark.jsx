function getQueryStringParam (param) {
  var url = window.location.toString()
  url.match(/\?(.+)$/)
  var params = RegExp.$1
  params = params.split('&')
  var queryStringList = {}
  for (var i = 0; i < params.length; i++) {
    var tmp = params[i].split('=')
    queryStringList[tmp[0]] = unescape(tmp[1])
  }
  return queryStringList[param]
}

function Bookmark (props) {
  return <div><img src={props.uri} /></div>
}

class InputUri extends React.Component {
  constructor (props) {
    super(props)

    const defaultUri = 'https://external-preview.redd.it/TcSzPOpGNxov4-zHd11YfCQP95CXM5aCY2FXxW8lwnU.jpg?auto=webp&s=1c4120f8d6c8a794b21d67d5b390db34f623ccf1'
    var uri = getQueryStringParam('uri') || defaultUri
    this.state = { uri: uri }
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (e) {
    this.setState({uri: e.target.value })
    console.log('this.state.uri', this.state.uri)
  }

  render () {
    return <div>
      Uri : <input size='80' onChange={this.handleChange} placeholder='uri' value={this.state.uri} />
      <hr />

      <Bookmark uri={this.state.uri} />
    </div>
  }

}
