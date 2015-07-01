var debug = require('debug')('api:launch')
var Promise = require('es6-promise').Promise;
var launch = require('launchpad');
var portscanner = require('portscanner')

function Launch(gateway) {

  var openBrowsers = [];

  var api = gateway.api
  var logger = gateway.logger

  api.launchBrowser = function (browserName, url) {

    return new Promise(function(resolve, reject) {

      debug('command.launchBrowser', {
        browser: browserName,
        url: url
      })

      switch (browserName) {
        case 'chrome':
          findPort().then(function(debugPort) {
            console.log('debugPort', debugPort)
            launch.local(function(err, local) {
              var options = {
                clean: true,
                args: ['--remote-debugging-port=' + debugPort]
              }

              local.chrome(url, options, function(err, instance) {
                if(err) reject(err)

                openBrowsers.push(instance)
                setTimeout(function() {
                  resolve({
                    debugPort: debugPort,
                    debugUrl: 'localhost:' + debugPort
                  })
                }, 2000)
              })
            })
          })
          break;

        case 'canary':
          var debugPort = 9222
          // findPort().then(function(debugPort) {

            launch.local(function(err, local) {
              var options = {
                clean: true,
                args: ['--remote-debugging-port=' + debugPort]
              }

              local.canary(url, options, function(err, instance) {
                if(err) reject(err)

                openBrowsers.push(instance)
                setTimeout(function() {
                  resolve({
                    debugPort: debugPort,
                    debugUrl: 'localhost:' + debugPort
                  })
                }, 2000)

              })
            })
          // })
          break;

        case 'opera':
          var debugPort = 9223

            launch.local(function(err, local) {
              var options = {
                clean: true,
                args: ['--remote-debugging-port=' + debugPort]
              }

              local.opera(url, options, function(err, instance) {
                if(err) reject(err)

                openBrowsers.push(instance)
                setTimeout(function() {
                  resolve({
                    debugPort: debugPort,
                    debugUrl: 'localhost:' + debugPort
                  })
                }, 2000);
              })
            })
          // })
          break;
      }
    })
  }

  api.closeOpenBrowsers = function() {
    openBrowsers.forEach(function(b) {
      b.stop()
    })
  }

  var findPort = function() {
    return new Promise(function(resolve, reject) {
      portscanner.findAPortNotInUse(9222, 9300, '127.0.0.1', function(err, port) {
        if(err) reject(err)
        resolve(port)
      })
    })
  }
}

module.exports = Launch
