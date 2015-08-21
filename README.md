Stream URLs
===========

The package aims to unite two powerful universal concepts: streams and
URLs.  It is mostly driven by desire to create modular distributed
applications connected by asynchronous interfaces.
Consider typical microservices. Those are connected by HTTP
request-response calls thus emulating a synchronous call graph in a
fundamentally asynchronous environment.  Stream-connected
architectures can be seen as distributed [go channels][go] instead.

Streams allow to pipeline operations, provide flow control, and, most
importantly, the concept of a stream is universal enough to use in 
very different settings.

For example, one may use loopback streams for testing, filesystem sockets
to connect local processes, WebSockets to pass data over the internet
and raw TCP streams for low-overhead inner network transmissions.
Considering isomorphic apps, inside the browser one may use postMessage
(frame to frame) or WebStorage (tab to tab) based streams.

This approach fits event sourcing architectures extremely well, as
all app's events are well serializable then.

So, stream-url encapsulates details of a particular medium and allows
the app to open *data streams to URLs*.
stream-url is a syntactic sugar, in a sense, or maybe even syntactic
cocaine, but it definitely helps to clear a subsystem's code out of
technical details and make it easily pluggable.

## API

* `listen(url [,options] [,callback])` start a server (stream factory)
    listening at the `url`, using `options`. Invoke `callback` when
    ready. The server will emit a `connection` event for every new
    incoming connection/stream.
* `connect(url [,options] [,callback])` connect to a server at (create
    a stream to) `url`. Invoke `callback` once ready to write.
    The stream will emit all the [usual events][stream]:
    `data`, `end`, `error`.


[go]: https://gobyexample.com/channels
[stream]: https://iojs.org/api/stream.html
