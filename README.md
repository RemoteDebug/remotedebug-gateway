remotedebug-gateway
================
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

A gateway for RemoteDebug (Chrome Remote Debugging) connections, that allows you to connect a client to multiple servers (browser instances)

![Logo](https://github.com/auchenberg/remotedebug-gateway/raw/master/logo.png)

Features
- Connecting to server by making GET request to ```/connect?port=<ports>```
- Matches targets across servers by matching the URLS
- Forwards requests from client to servers
- Forwards replies from first-connected server to client
- Keeps track of node ids from servers, and matches requests to the correct node of connected servers
- Ability to hijack and incepter requests/resposes via Intercepter
- Enable screencasting for Chrome desktop.

### How to get started?

#### Gateway
1. Run ``npm install``
2. Run ``npm start``

**NOTICE**: This project is highly experimental, and shouldn't be used in ANY production-like environment, as there's absolutely no security or privacy.
