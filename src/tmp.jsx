import React from 'react'
import ReactDOM from 'react-dom'
import NavbarSolid from './components/bulma/Navbar.jsx'
import 'babel-polyfill'

const { default: data } = require('@solid/query-ldflex');



class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = { label : 'empty' }
  }

  render () {

    const ruben = data['https://ruben.verborgh.org/profile/#me'];
    showProfile(ruben);
    var label = 'empty'
    
    async function showProfile(person) {
      label = await person.label;
      console.log(`\nNAME: ${label}`);
    
      console.log('\nTYPES');
      for await (const type of person.type)
        console.log(`  - ${type}`);
    
      console.log('\nFRIENDS');
      for await (const name of person.friends.firstName)
        console.log(`  - ${name} is a friend`);
    }
    

    return (
      <span>
      <div className='App'>
        <NavbarSolid className="is-link" title="Tmp App" sourceCode="https://github.com/play-grounds/react/blob/gh-pages/play/tmp.html"></NavbarSolid> 
      </div>

      <div id="section">
      {label}
      </div>
      </span>
    )
  }
}




ReactDOM.render(<App />, document.getElementById('root'))
