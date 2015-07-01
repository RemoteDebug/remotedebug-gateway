#!/usr/bin/env node

var optimist = require('optimist')
var Gateway = require('./')

process.title = 'remotedebug-gateway'

var argv = optimist
  .usage('Usage: $0 url [options]')
  .alias('b', 'browsers').describe('b', 'browsers to launch').default('b', 'canary')
  .alias('p', 'port').describe('p', 'change the http port').default('p', 9000)
  .describe('version', 'prints current version').boolean('boolean')
  .argv

if (argv.version) {
  console.error(require('./package').version)
  process.exit(0)
}

var g = new Gateway({
  httpPort: argv.port
});

Promise.delay = function(ms) {
  return new Promise(function(r) {
    setTimeout(r, ms);
  })
}

if(argv.browsers) {

  var url = argv._[0] || 'about:blank'

  var allBrowser = argv.browsers.split(',').map(function(browserName) {
    console.log('.. launching browsers:', browserName);
    return g.api.launchBrowser(browserName, url).then(function(browserInfo) {
      console.log('.. launched.', browserInfo)
      return g.api.connect(browserInfo.debugUrl)
    })
  });

  Promise.all(allBrowser).then(function() {
    var target = g.api.findTargetByUrl(url);
    if(target) {
      console.log('.. done:');
      process.stdout.write(target.devtoolsUrl)
    }
  })

}

process.on('SIGINT', function() {
  g.api.closeOpenBrowsers();
  process.exit();
})
