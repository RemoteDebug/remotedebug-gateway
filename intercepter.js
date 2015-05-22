var deepPluck = require('deep-pluck')
var logger = require('./logger')

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
    }
    return msg
  }
}

module.exports = new Intercepter()
