var request = require('request')
var Promise = require('es6-promise').Promise;

function Targets(gateway) {

  var api = gateway.api
  var logger = gateway.logger

  api.findTargetByUrl = function (url) {
    var combinedTargets = gateway.combinedTargets

    var item = combinedTargets.filter(function (item) {
      return item.url === url
    })

    return item ? item[0] : null
  }

  api.findTargetById = function (id) {
    var combinedTargets = gateway.combinedTargets

    var item = combinedTargets.filter(function (item) {
      return item.id === id
    })
    return item ? item[0] : null
  }

  api.addTarget = function (info, sourceKey) {
    var targets = gateway.targets
    var id = info.id
    var webSocketUrl = (process.env.HEROKU_URL ? process.env.HEROKU_URL : ('localhost:' + app.get('port'))) + '/devtools/page/' + id

    var target = {
      description: info.description,
      devtoolsFrontendUrl: '/devtools/devtools.html?ws=' + webSocketUrl,
      devtoolsUrl: 'chrome-devtools://devtools/remote/serve_rev/@06a2e65a4f3610ec17dbc5988c0b16a95825240a/inspector.html?ws=' + webSocketUrl + '&remoteFrontend=true&dockSide=unlocked',
      id: id,
      title: info.title,
      type: 'page',
      url: info.url,
      webSocketDebuggerUrl: 'ws://' + webSocketUrl,
      clientUrls: [info.webSocketDebuggerUrl],
      source: sourceKey,
      connections: []
    }

    targets[sourceKey] = targets[sourceKey] || {}
    targets[sourceKey][info.id] = target
  }

  api.getTargetsOverview = function () {
    var unifiedTargets = []
    var targets = gateway.targets

    Object.keys(targets).forEach(function (sourceKey) {
      var targetList = targets[sourceKey]

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
}

module.exports = Targets
