var request = require('request')

function Connect(gateway) {

  var app = gateway.app

  app.get('/connect', function (req, res) {
    var ips = (req.query['ip'] || '').split(',')
    var ports = (req.query['port'] || '').split(',')

    logger.info('http.connect', {
      ips: ips
    })

    ips.forEach(function (ip) {
      gateway.api.connect(ip);
    })

    ports.forEach(function (port) {
      gateway.api.connect('localhost:' + port);
    })

    res.json({
      msg: 'Ok'
    })
  })

}

module.exports = Connect
