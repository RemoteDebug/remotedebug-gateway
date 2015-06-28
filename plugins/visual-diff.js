var logger = require('../logger')
var Promise = require('es6-promise').Promise
var resemble = require('resemble').resemble

function VisualDiffPlugin () {

  var frameBuffer = [];

  this.onRequest = function (msg, target, connection, socket) {
    return new Promise(function (resolve, reject) {
      resolve(msg)
    })
  },

  this.onResponse = function (msg, target, connection, socket) {

    return new Promise(function (resolve, reject) {

      if (msg.method && msg.method === 'Page.screencastFrame') {
        logger.log('VisualDiffPlugin.screencastFrame');

        frameBuffer.push(msg.params.data);

        // Make sure we always have the two latest frames
        if (frameBuffer.length > 2) {
          frameBuffer.shift();
        }

        if (frameBuffer.length > 1) {
          var img1 = new Buffer(frameBuffer[0], 'base64');
          var img2 = new Buffer(frameBuffer[1], 'base64');

          logger.log('VisualDiffPlugin.compare');

          resemble(img1).compareTo(img2).onComplete(function(diffData){
            logger.log('VisualDiffPlugin.compare.complete', diffData);
            var url = diffData.getImageDataUrl();
            url = url.replace(/^data:image\/\w+;base64,/,"")
            msg.params.data = url

            resolve(msg)
          })

        } else {
          resolve(msg)
        }
      } else {
        resolve(msg)
      }

    })

  }
}

module.exports = new VisualDiffPlugin()
