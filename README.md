Stream URLs
===========

The package aims to unite two powerful universal concepts: streams and
URLs. `stream-url` encapsulates details of a particular medium and allows
the app to open *data streams to URLs*.
stream-url is a syntactic sugar, in a sense, but it definitely helps to
clear a subsystem's code out of technical details and make it easily
pluggable.

```
    var su = require('stream-url');
    
    // TCP server
    var tcp_server = su.listen('tcp://localhost:1234', (err, serv) => {
        serv.on('connection', stream => {
        ...
        
    // stdin/stdout "client"
    su.connect('std:', (err, stream) => {
        ...
```

[![Build Status](https://travis-ci.org/gritzko/stream-url.svg?branch=master)](https://travis-ci.org/gritzko/stream-url)

## API

* `listen(url [,options] [,callback])` start a server (stream factory)
    listening at the `url`, using `options`. Invoke `callback(err,
    server)` when ready or failed.
    The server will emit a `connection` event for every new
    incoming connection/stream.
* `connect(url [,options] [,callback])` connect to a server at (create
    a stream to) `url`. Invoke `callback(err, stream)` once ready to
    write or failed to connect.
    The stream will emit all the [usual events][stream]:
    `data`, `end`, `error`.

This package defines just one fictive URL protocol named `0` which
masquerades local invocations for a stream. The 0 protocol is mostly
useful for connecting componenets locally. It is not that useful for
unit testing as it skips serialization/ deserialization for the sake
of efficiency. See [test/][test] for usage examples.

All "real" protocols are defined in separate packages, as those
introduce non-trivial dependencies.

- [x] [server-side WebSocket][su-ws]
- [x] [TCP][su-node]
- [ ] [HTTP][su-node]
- [x] [filesystem sockets][su-node]
- [x] [stdin/stdout][su-node]
- [x] [loopback streams][swarm-bat]

[go]: https://gobyexample.com/channels
[stream]: https://iojs.org/api/stream.html
[test]: test/01_connect_listen.js
[su-ws]: https://github.com/gritzko/stream-url-ws
[su-node]: https://github.com/gritzko/stream-url-node
[swarm-bat]: https://github.com/gritzko/swarm
