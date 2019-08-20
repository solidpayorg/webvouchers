import React from 'react'

/** Displays a literal by value. */
export default function Literal ({value, ...props}) {
  var contentType = 'text'
  if (/.jpg$|.png$/.test(value)) {
    contentType = 'image'
  }
  if (contentType === 'image') {
    return <img src={value} />
  } else {
    return <span>{value}</span>
  }
}
