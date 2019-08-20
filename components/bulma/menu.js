"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Menu;

function MenuAbout(props) {
  return React.createElement("div", {
    className: "navbar-item has-dropdown is-hoverable"
  }, React.createElement("a", {
    className: "navbar-link"
  }, "About"), React.createElement("div", {
    className: "navbar-dropdown"
  }, React.createElement("a", {
    href: "index.html",
    className: "navbar-item"
  }, "Up"), React.createElement("hr", null), React.createElement("a", {
    className: "navbar-item",
    target: "_blank",
    href: ""
  }, "Source"), React.createE/** Displays a literal by value. */
export function Literal (props) {
  return <span>{props.value}</span>
}
ement("hr", null), React.createElement("a", {
    className: "navbar-item",/** Displays a literal by value. */
export function Literal (props) {
  return <span>{props.value}</span>
}

    target: "_blank",
    href: ""
  }, "Help")));
}

function Menu(props) {
  function toggleNav() {
    var nav = document.querySelector('.navbar-menu');

    if (nav.className === 'navbar-menu') {
      nav.className = 'navbar-menu is-active';
    } else {
      nav.className = 'navbar-menu';
    }
  }

  return React.createElement("nav", {
    className: 'navbar ' + props.className,
    role: "navigation",
    "aria-label": "main navigation"
  }, React.createElement("div", {
    className: "navbar-brand"
  }, React.createElement("a", {
    id: "add",
    className: "navbar-item",
    href: "#"
  }, props.title), React.createElement("a", {
    role: "button",
    className: "navbar-burger burger",
    "aria-label": "menu",
    "aria-expanded": "false",
    "data-target": "navbarBasicExample",
    onClick: toggleNav
  }, React.createElement("span", {
    "aria-hidden": "true"
  }), React.createElement("span", {
    "aria-hidden": "true"
  }), React.createElement("span", {
    "aria-hidden": "true"
  }))), React.createElement("div", {
    id: "navbarBasicExample",
    className: "navbar-menu"
  }, React.createElement("div", {
    className: "navbar-start"
  }, React.createElement(MenuAbout, null)), React.createElement("div", {
    className: "navbar-end"
  })));
}