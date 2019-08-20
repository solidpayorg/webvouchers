//REMOVE import React from 'react' ; import ReactDOM from 'react-dom' 

class Addressbar extends React.Component {
  constructor (props) {
    super(props)
    if (props.subject) {
      this.state = { subject : props.subject, view : props.view }
    }
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (event) {
    this.setState({subject: event.target.value })
    let href =  window.location.href.split('?')[0] 
    href += '?uri=' + encodeURIComponent(event.target.value)
    href += '&view=' 
    href += this.state.view ? this.state.view : ''
    history.pushState({}, 'App', href)
  }

  render () {

    const children = React.Children.map(this.props.children, child => {
      return React.cloneElement(child, {
        subject: this.state.subject,
        view : this.state.view
      });
    });

    return (<div>
      <label>Address</label>
      <br/> 
      <input size='80' onChange={this.handleChange} placeholder='uri' value={this.state.subject} />
      <hr />

      {children}
    </div>)
  }

}

//REMOVE export default Addressbar
