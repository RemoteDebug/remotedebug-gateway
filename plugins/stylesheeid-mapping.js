var logger = require('../logger')
var Promise = require('es6-promise').Promise
var debug = require('debug')('plugin:stylesheetid')

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
          debug('plugin.stylesheetid.intercept', msg.params.styleSheetId)
          if (stylesheetIndex && stylesheetIndex[socket.url]) {

            var index = stylesheetIndex[masterSocketUrl].indexOf(msg.params.styleSheetId)
            var mappedId = stylesheetIndex[socket.url][index]

            if (mappedId) {
              debug('plugin.stylesheetid.overridden', msg.params.styleSheetId, mappedId)
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

      if (msg.result && msg.result.inlineStyle && typeof msg.result.inlineStyle === 'object') {

        var index = stylesheetIndex[socket.url]
        if(!index) {
          stylesheetIndex[socket.url] = []
          index = stylesheetIndex[socket.url]
        }

        var styleSheetId = msg.result.inlineStyle.styleSheetId

        debug('plugin.stylesheetid.inlineStyle.styleSheetId', styleSheetId)
      
        if(index.indexOf(styleSheetId) === -1) {
          index.push(styleSheetId)
        }
      }

      if (msg.method === 'CSS.styleSheetAdded') {
        var index = stylesheetIndex[socket.url]
        if(!index) {
          stylesheetIndex[socket.url] = []
          index = stylesheetIndex[socket.url]
        }

        var styleSheetId = msg.params.header.styleSheetId

        debug('plugin.stylesheetid.styleSheetAdded.styleSheetId', styleSheetId)
        debug('plugin.stylesheetid.styleSheetAdded.stylesheetIndex', stylesheetIndex)

        index.push(styleSheetId)
      }

      resolve(msg)
    })
  }

}

module.exports = new StyleSheetIds()
