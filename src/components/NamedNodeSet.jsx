//REMOVE import React from 'react'

function NamedNodeSet(props) {
  var nodes = props.nodes;
  if (nodes) {
    var nodeSet = nodes.map((node) => {
      return <NamedNode node={node.object}></NamedNode>
    })
    return (
      <ul>{nodeSet}</ul>
    );
  } else {
    return <div>Empty</div>
  }
}

//REMOVE export default NamedNodeSet