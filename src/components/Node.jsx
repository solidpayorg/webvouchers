import React from 'react'

import Literal from './Literal.jsx'
import NamedNode from './NamedNode.jsx'

/** Displays a Node by value. */
export default function Node ({value, termType, ...props}) {
  if (termType === 'literal') {
    return <Literal value={value} />
  } else if (termType === 'namedNode') {
    return <NamedNode value={value} />
  }
}
