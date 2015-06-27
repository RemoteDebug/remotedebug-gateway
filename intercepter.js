var requireDir = require('require-dir')
var logger = require('./logger')

var loadedPlugins = requireDir('./plugins')
var plugins = Object.keys(loadedPlugins).map(function (key) {
  return loadedPlugins[key]
})

var Intercepter = function () {

  this.hijackRequest = function (msg, target, connection, socket) {
    logger.info('Intercepter.hijackRequest', msg.id, msg.method)

    plugins.forEach(function (plugin) {
      msg = plugin.onRequest(msg, target, connection, socket)
    })

    return msg
  }

  this.hijackResponse = function (msg, target, connection, socket) {
    logger.info('Intercepter.hijackResponse', msg.id)

    plugins.forEach(function (plugin) {
      msg = plugin.onResponse(msg, target, connection, socket)
    })

    return msg
  }

}

module.exports = new Intercepter()
