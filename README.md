remotedebug-gateway
================
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

A gateway for RemoteDebug (Chrome Remote Debugging) connections, that allows you to connect a client to multiple servers (browser instances)

![Logo](https://github.com/auchenberg/remotedebug-gateway/raw/master/logo.png)

Features
- Chrome HTTP endpoint ```/json``` for compatbility with Chrome DevTools app.
- Matches targets across servers by matching the URLS
- Forwards requests from client to servers
- Forwards replies from first-connected server to client
- Ability to hijack and incepter requests/resposes via plugin architecture
   	- Plugin: Enable screencasting for Chrome desktop.
   	- Plugin: Realtime visual regression testing.
		- Keeps track of node ids from servers, and matches requests to the correct node of connected servers

### Installation

1. Run ``npm install remotedebug-gateway -g``

### Run
1. Run ``rd-gateway <url> -b <browsers`` ala ``rd-gateway http://kenneth.io -b canary,opera``
2. The browsers should now open with the URL
3. Copy paste the DevTools URL into a Chrome window that has been outputted the console.
4. Party!

**NOTICE**: This project is highly experimental, and shouldn't be used in ANY production-like environment, as there's absolutely no security or privacy.
