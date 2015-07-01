var logger = require('../logger')
var Promise = require('es6-promise').Promise

// This plugin enables screencasting for all clients.
function ScreencastingPlugin () {

  this.onRequest = function (msg, target, connection, socket) {
    return new Promise(function (resolve, reject) {
      if (msg.method && msg.method === 'Page.canScreencast') {
        logger.info('ScreencastingPlugin.Page.canScreencast')
        var reply = {
          id: msg.id,
          result: {
            result: true
          }
        }
        connection.send(JSON.stringify(reply))
        resolve(null)
      } else {
        resolve(msg)
      }
    })
  },

  this.onResponse = function (msg, target, connection, socket) {
    return new Promise(function (resolve, reject) {
      resolve(msg)
    })
  }

}

module.exports = new ScreencastingPlugin()
