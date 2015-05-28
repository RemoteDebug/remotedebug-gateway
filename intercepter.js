var deepPluck = require('deep-pluck')
var logger = require('./logger')

Array.prototype.insert = function (index, items) {
  this.splice.apply(this, [index, 0].concat(items));
}

var Intercepter = function () {
  var getDocumentIndex = {}
  var masterSocketUrl
  var nodeIndex = {}

  this.hijackRequest = function (msg, target, connection, socket) {
    logger.info('hijackRequest', msg.id, msg.method)

    if (msg.method && msg.method === 'DOM.getDocument') {
      getDocumentIndex[socket.url] = msg.id
    }

    if (msg.method && msg.method === 'Page.canScreencast') {
      var reply = {
        id: msg.id,
        result: {
          result: true
        }
      }
      connection.send(JSON.stringify(reply))
      return null
    }

    if (target.connections.indexOf(socket) === 0) {
      masterSocketUrl = socket.url
    }

    // Re-write node-ids for all other sockets than the first/master
    if (target.connections.indexOf(socket) > 0) {
      if (msg.params && msg.params.nodeId) {
        if (nodeIndex && nodeIndex[socket.url]) {
          var index = nodeIndex[masterSocketUrl].indexOf(msg.params.nodeId)
          var mappedNodeId = nodeIndex[socket.url][index]
          msg.params.nodeId = mappedNodeId
        }
      }
    }

    return msg
  }

  this.hijackResponse = function (msg, target, connection, socket) {
    logger.info('hijackResponse', msg.id)

    if (msg.id === getDocumentIndex[socket.url]) {
      nodeIndex[socket.url] = deepPluck(msg.result, 'nodeId')
      console.log('DOM.getDocument.index.updated',  nodeIndex[socket.url]);
    }

    if(msg.method === 'DOM.setChildNodes') {
      var nodeId = msg.params.parentId
      var index =  nodeIndex[socket.url]

      if(index) {
        var nodeIndexPosition = index.indexOf(nodeId) + 1
        var newNodeIds = deepPluck(msg.params.nodes, 'nodeId')
        // Insert at nodeIndexPosition
        index.insert(nodeIndexPosition, newNodeIds)
        console.log('DOM.setChildNode.index.updated', index);
      }
    }

    return msg
  }
}

module.exports = new Intercepter()
