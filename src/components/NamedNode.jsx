//REMOVE import React from 'react'

/** Displays a NamedNode by value. */
function NamedNode({node, ...props}) {
  if (node.termType === 'Literal') {
    return <li>{node.value}</li>
  } else {
    return <li><a href={node.value} target="_blank">{node.value}</a></li>
  }
}

//REMOVE export default NamedNode