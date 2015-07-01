var debug = require('debug')('api:connect')
var request = require('request')
var Promise = require('es6-promise').Promise;

function Connect(gateway) {

  var api = gateway.api
  var logger = gateway.logger

  api.connect = function (ip) {

    return new Promise(function(resolve, reject) {

      var url = 'http://' + ip + '/json'
      var options = {
        url: url,
        method: 'GET',
        json: true
      }

      debug('api.connect', url)

      request(options, function (err, data) {
        if(err) {
          debug('api.connect.error', err)
          reject(err)
        } else {
          debug('api.connect.complete', data.body)

          data.body.forEach(function (target) {
            api.addTarget(target, url)
          })

          gateway.combinedTargets = api.getTargetsOverview()
          resolve(gateway.combinedTargets)
        }
      })

    })
  }

}

module.exports = Connect
