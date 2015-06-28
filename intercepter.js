var requireDir = require('require-dir')
var logger = require('./logger')
var Promise = require('es6-promise').Promise;

var loadedPlugins = requireDir('./plugins')
var plugins = Object.keys(loadedPlugins).map(function (key) {
  return loadedPlugins[key]
})
logger.info('Intercepter.plugins', plugins.length)

var Intercepter = function () {

  this.hijackRequest = function (msg, target, connection, socket) {
    logger.info('Intercepter.hijackRequest', msg.id, msg.method)

    var queue = Promise.resolve(msg);
    plugins.forEach(function (plugin) {
      queue = queue.then(function(msg){
        return plugin.onRequest(msg, target, connection, socket)
      });
    })
    return queue;

  }

  this.hijackResponse = function (msg, target, connection, socket) {
    logger.info('Intercepter.hijackResponse', msg.id)

    var queue = Promise.resolve(msg);
    plugins.forEach(function (plugin) {
      queue = queue.then(function(msg){
        return plugin.onResponse(msg, target, connection, socket)
      });
    })
    return queue;

  }

}

module.exports = new Intercepter()
