
function Gateway(options) {

  this.logger = require('./logger')
  this.options = options
  this.targets = {}
  this.combinedTargets = []
  this.api = {}

  // HTTP
  var http = require('./http/core')(this)
  this.app = http.app

  // API
  require('./api/targets')(this)
  require('./api/launch')(this)
  require('./api/connect')(this)

  // HTTP actions
  require('./http/connect')(this)
  require('./http/json')(this)

  // WebSocket
  require('./websocket/core')(this)

  return this

}

module.exports = Gateway;
