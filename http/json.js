var clone = require('clone')

function JSON(gateway) {

	var app = gateway.app
	var logger = gateway.logger

	app.get('/json', function (req, res) {

		var combinedTargets = gateway.combinedTargets
	  var formattedTargets = Object.keys(combinedTargets).map(function (key) {
	    var target = clone(combinedTargets[key], false)
	    delete target.connections
	    return target
	  })

	  logger.info('http.json', {
	    targets: formattedTargets
	  })

	  res.send(formattedTargets)
	})

}

module.exports = JSON;
