// REMOVE import React from 'react' ; import ReactDOM from 'react-dom'

class AddressBar extends React.Component {
  constructor (props) {
    super(props)
    if (props.subject) {
      this.state = {
        subject: props.subject,
        setSubject: this.setSubject
      }
    }
    this.handleChange = this.handleChange.bind(this)
    this.setState = this.setState.bind(this)
  }

  handleChange (event) {
    this.setState({ subject: event.target.value })

    if (event.target.value !== '') {
      history.pushState(
        {},
        'Bookmark App',
        window.location.href.split('?')[0] +
          '?uri=' +
          encodeURIComponent(event.target.value)
      )
    } else {
      history.pushState({}, 'Bookmark App', window.location.href.split('?')[0])
    }
  }

  setSubject (subject) {
    this.setState({ subject: subject })
  }

  render () {
    var self = this

    const children = React.Children.map(this.props.children, child => {
      return React.cloneElement(child, {
        subject: this.state.subject,
        setState: this.setState
      })
    })

    return (
      <div>
        <label>Address</label>
        <br />
        <input
          style={{ width: '95%' }}
          onChange={this.handleChange}
          placeholder='uri'
          value={this.state.subject}
        />{' '}
        <a href={this.state.subject} target='_blank'>
          <img height='10' width='10' src='./image/External.svg' />
        </a>
        <hr />
        {children}
      </div>
    )
  }
}

// REMOVE export default AddressBar
