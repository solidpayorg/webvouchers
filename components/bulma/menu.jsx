
function MenuAbout (props) {
  return <div className='navbar-item has-dropdown is-hoverable'>
    <Menu.List title="About">
      <Menu.List.Item href='index.html'>Up</Menu.List.Item>
      <hr />
      <Menu.List.Item href=''>Source</Menu.List.Item>
      <hr />
      <Menu.List.Item href=''>Help</Menu.List.Item>
    </Menu.List>
  </div>
}

function MenuListItem ({href, ...props}) {
  return (
    <a href={href} className='navbar-item'>
    {props.children}
    </a>    
  )
}

function MenuList ({title, ...props}) {
  return (
    <span>
    <a className='navbar-link'>
      {title}
    </a>

    <div className='navbar-dropdown'>
      {props.children}
    </div>
    </span>
  )
}

function Menu ({title, ...props}) {
  function toggleNav () {
    var nav = document.querySelector('.navbar-menu')
    if (nav.className === 'navbar-menu') {
      nav.className = 'navbar-menu is-active'
    } else {
      nav.className = 'navbar-menu'
    }
  }

  return <nav className={'navbar ' + props.className} role='navigation' aria-label='main navigation'>
    <div className='navbar-brand'>

      <Menu.List.Item href='#'>{title}</Menu.List.Item>

      <a role='button' className='navbar-burger burger' aria-label='menu' aria-expanded='false' data-target='navbarBasicExample' onClick={toggleNav}>
        <span aria-hidden='true' />
        <span aria-hidden='true' />
        <span aria-hidden='true' />
      </a>
    </div>

    <div id='navbarBasicExample' className='navbar-menu'>
      <div className='navbar-start'>
        <Menu.About />
      </div>

      {props.children}

      <div className='navbar-end' />
    </div>
  </nav>
}

Menu.About = MenuAbout
Menu.List = MenuList
Menu.List.Item = MenuListItem

