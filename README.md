remotedebug-gateway
================
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

A gateway for RemoteDebug (Chrome Remote Debugging) connections, that allows you to connect a client to multiple browsers at once.

![Logo](https://github.com/auchenberg/remotedebug-gateway/raw/master/logo.png)

### Features
- Chrome HTTP endpoint ```/json``` for compatbility with [Chrome DevTools app](https://github.com/auchenberg/chrome-devtools-app).
- Builds unified list of debuggable targets across connected browsers
- Ability to hijack and incepter requests/responses via plugin architecture
   	- Plugin: Enable screencasting for Chrome desktop.
   	- Plugin: Realtime visual regression testing.
	- Keeps track of node ids from servers, and matches requests to the correct node of connected servers

### Plugin: Visual regression
![](https://github.com/auchenberg/remotedebug-gateway/raw/master/visual-diff.jpg)


### Installation

1. ``npm install remotedebug-gateway -g``

### Run
1. ``rd-gateway <url> -b <browsers`` ala ``rd-gateway http://kenneth.io -b canary,opera``
2. The browsers should now open with the URL
3. Copy paste the DevTools URL into a Chrome window that has been outputted the console.
4. Party!

**NOTICE**: This project is highly experimental, and shouldn't be used in ANY production-like environment, as there's absolutely no security or privacy.
