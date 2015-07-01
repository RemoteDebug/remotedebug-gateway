var logger = require('../logger')
var Promise = require('es6-promise').Promise

function StyleSheetIds () {
  var masterSocketUrl
  var stylesheetIndex = {}

  this.onRequest = function (msg, target, connection, socket) {

    return new Promise(function (resolve, reject) {

      if (target.connections.indexOf(socket) === 0) {
        masterSocketUrl = socket.url
      }

      // Re-map
      if (target.connections.indexOf(socket) > 0) {
        if (msg.params && msg.params.styleSheetId) {
          logger.info('stylesheetId.intercept', msg.params.styleSheetId)
          if (stylesheetIndex && stylesheetIndex[socket.url]) {

            var index = stylesheetIndex[masterSocketUrl].indexOf(msg.params.styleSheetId)
            var mappedId = stylesheetIndex[socket.url][index]

            if (mappedId) {
              logger.info('stylesheetId.overridden', msg.params.styleSheetId, mappedId)
              msg.params.styleSheetId = mappedId
            }
          }
        }
      }
      resolve(msg)
    })
  },

  this.onResponse = function (msg, target, connection, socket) {
    return new Promise(function (resolve, reject) {

      if (msg.method === 'CSS.styleSheetAdded') {
        var index = stylesheetIndex[socket.url]
        if(!index) {
          stylesheetIndex[socket.url] = []
          index = stylesheetIndex[socket.url]
        }

        var styleSheetId = msg.params.header.styleSheetId
        index.push(styleSheetId)
      }

      resolve(msg)
    })
  }

}

module.exports = new StyleSheetIds()
