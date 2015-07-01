var WebSocket = require('ws')
var WebSocketServer = require('ws').Server
var intercepter = require('./intercepter')

function WebSocketCore(gateway) {

	var logger = gateway.logger

	// Native WebSockets for DevTools
	// logger.info('websocket.booting')

	var ws = new WebSocketServer({
	  server: server,
	  path: /\/devtools\/page\/(.*)/
	})

	ws.on('error', function (err) {
	  logger.error('websocket.error', err)
	})

	ws.on('connection', function (connection) {
	  var pageId = extractPageId(connection.upgradeReq.url)
	  logger.info('websocket.connected', pageId)
	  setupPageConnection(pageId, connection)
	})

	var extractPageId = function (str) {
	  return str.match(/\/devtools\/page\/(.*)/)[1]
	}

	var setupPageConnection = function (pageId, connection) {
	  var target = gateway.api.findTargetById(pageId)

	  if (!target) throw new Error('Target not found')

	  var connectClient = function (url) {
	    var socket = new WebSocket(url)
	    target.connections.push(socket)

	    socket.on('error', function (err) {
	      logger.error('client.socket.err', err)
	    })

	    socket.on('close', function (err) {
	      logger.info('client.socket.close', err)
	    })

	    socket.on('open', function () {
	      logger.info('client.socket.connected')

	      // Responses from connected clients
	      socket.on('message', function (data) {
	        var msg = JSON.parse(data)

	        intercepter.hijackResponse(msg, target, connection, socket).then(function (msg) {
	          if (!msg) return

	          // Only forward messages from the first connected socket - for now
	          if (target.connections.indexOf(socket) === 0) {
	            connection.send(JSON.stringify(msg))
	          }

	        })
	      })

	      // Requests coming from DevTools
	      connection.on('message', function (data) {
	        var msg = JSON.parse(data)

	        intercepter.hijackRequest(msg, target, connection, socket).then(function (msg) {
	          logger.info('websocket.' + socket.url + '.message.send')
	          if (!msg) return

	          if (socket.readyState === WebSocket.OPEN) {
	            socket.send(JSON.stringify(msg))
	          }

	        })
	      })
	    })

	    connection.on('error', function (err) {
	      logger.error('connection.websocket.error', err)
	    })
	  }

	  target.clientUrls.forEach(function (url) {
	    connectClient(url)
	  })

	  connection.on('close', function (data) {
	    logger.info('connection.websocket.close')
	    target.connections.forEach(function (conn) {
	      conn.close()
	    })
	    target.connections = []
	  })

	}

}

module.exports = WebSocketCore
