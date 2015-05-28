var express = require('express')
var http = require('http')
var WebSocket = require('ws')
var WebSocketServer = require('ws').Server
var logger = require('./logger')
var request = require('request')
var clone = require('clone')
var intercepter = require('./intercepter')

var _targets = {}
var targets = {}

// HTTP for /json endpoint
logger.info('http.booting')

var app = express()
app.set('port', process.env.PORT || 8000)

app.get('/', function (req, res) {
  logger.info('http.index')
  res.json({
    msg: 'Hello'
  })
})

app.get('/connect', function (req, res) {
  var ports = req.query['port'].split(',')

  logger.info('http.connect', {
    port: ports
  })

  ports.forEach(function (port) {
    fetchTargets(port)
  })

  res.json({
    msg: 'Ok'
  })
})

app.get('/json', function (req, res) {
  var formattedTargets = Object.keys(targets).map(function (key) {
    var target = clone(targets[key], false)
    delete target.connections
    return target
  })

  logger.info('http.json', {
    targets: formattedTargets
  })

  res.send(formattedTargets)
})

var server = http.Server(app)

server.listen(app.get('port'), function () {
  logger.info('http.listening')
  logger.info('- listening on port %d in %s mode', app.get('port'), app.settings.env)
})

// Native WebSockets for DevTools
logger.info('websocket.booting')

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

var addTarget = function (info, sourceKey) {
  var id = info.id
  var webSocketUrl = (process.env.HEROKU_URL ? process.env.HEROKU_URL : ('localhost:' + app.get('port'))) + '/devtools/page/' + id

  var target = {
    description: info.description,
    devtoolsFrontendUrl: '/devtools/devtools.html?ws=' + webSocketUrl,
    devtoolsUrl: 'chrome-devtools://devtools/bundled/devtools.html?ws=' + webSocketUrl + '&remoteFrontend=true',
    id: id,
    title: info.title,
    type: 'page',
    url: info.url,
    webSocketDebuggerUrl: 'ws://' + webSocketUrl,
    clientUrls: [info.webSocketDebuggerUrl],
    source: sourceKey,
    connections: []
  }

  _targets[sourceKey] = _targets[sourceKey] || {}
  _targets[sourceKey][info.id] = target
}

var fetchTargets = function (port) {
  var url = 'http://localhost:' + port + '/json'

  var options = {
    url: url,
    method: 'GET',
    json: true
  }

  request(options, function (err, data) {
    if (!err) {
      data.body.forEach(function (target) {
        addTarget(target, url)
      })
      targets = getTargetsOverview()
    }
  })

}

var getTargetsOverview = function () {
  var unifiedTargets = []

  Object.keys(_targets).forEach(function (sourceKey) {
    var targetList = _targets[sourceKey]

    Object.keys(targetList).forEach(function (targetKey) {
      var target = targetList[targetKey]

      if (!unifiedTargets[target.url]) { // New
        unifiedTargets[target.url] = target
      } else { // Pad client to clientUrls
        unifiedTargets[target.url].clientUrls.push(target.clientUrls[0])
      }
    })
  })

  return Object.keys(unifiedTargets).map(function (key) {
    return unifiedTargets[key]
  })
}

var findTargetById = function (id) {
  var item = targets.filter(function (item) {
    return item.id === id
  })
  return item ? item[0] : null
}

var setupPageConnection = function (pageId, connection) {
  var target = findTargetById(pageId)

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
        msg = intercepter.hijackResponse(msg, target, connection, socket)
        if(!msg) return

        // Only forward messages from the first connected socket - for now
        if (target.connections.indexOf(socket) === 0) {
          connection.send(JSON.stringify(msg))
        }
      })

      // Requests coming from DevTools
      connection.on('message', function (data) {
        var msg = JSON.parse(data)
        msg = intercepter.hijackRequest(msg, target, connection, socket)
        if(!msg) return

        logger.info('websocket.' + socket.url + '.message.send', msg)

        if(socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(msg))
        }
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
