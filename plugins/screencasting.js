var logger = require('../logger')

function ScreencastingPlugin () {

  this.onRequest = function (msg, target, connection, socket) {
    if (msg.method && msg.method === 'Page.canScreencast') {
      logger.info('ScreencastingPlugin.Page.canScreencast')
      var reply = {
        id: msg.id,
        result: {
          result: true
        }
      }
      connection.send(JSON.stringify(reply))
      return null
    }
    return msg
  },

  this.onResponse = function (msg, target, connection, socket) {
    return msg
  }

}

module.exports = new ScreencastingPlugin()
