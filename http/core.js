var debug = require('debug')('http:core')
var express = require('express')
var http = require('http')

var logger = require('../logger')

function HTTP(gateway) {

	debug('http.booting')

	var app = express()
	app.set('port', gateway.options.httpPort)

	app.get('/', function (req, res) {
	  logger.info('http.index')
	  res.json({
	    msg: 'Hello! This is RemoteDebug Gateway'
	  })
	})

	var server = http.Server(app)

	server.listen(app.get('port'), function () {
	  debug('http.listening')
	  debug('- listening on port %d in %s mode', app.get('port'), app.settings.env)
	})

	this.app = app
	this.server = server

	return this

}

module.exports = HTTP

