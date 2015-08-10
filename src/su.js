"use strict";
var url = require('url');
var bat = require('swarm-bat');

// returns some "handler object" that has .close() method
// and emits 'connection' event
function listen (stream_url, callback) {
    var u = url.parse(stream_url.toString());
    var adaptor = adaptors[u.protocol];
    if (!adaptor) {
        throw new Error('protocol unknown: '+u.protocol);
    }
    return adaptor.listen(u, callback);
}

// returns a stream, either immediately or through the callback
function connect (stream_url, callback) {
    var u = url.parse(stream_url.toString());
    var adaptor = adaptors[u.protocol];
    if (!adaptor) {
        throw new Error('protocol unknown: '+u.protocol);
    }
    return adaptor.connect(u, callback);
}

function register (protocol, listen_handler, connect_handler) {
    adaptors[protocol] = {
        listen: listen_handler,
        connect: connect_handler
    };
}

var adaptors = {};

// just as an example, register adaptors for loopback streams
register('loopback:', loopback_listen, loopback_connect);

function loopback_listen (stream_url, callback) {
    return new bat.BatServer(stream_url.host, {}, callback);
}

function loopback_connect (stream_url, callback) {
    var stream = new bat.BatStream();
    stream.connect(stream_url.host, {}, callback);
    return stream;
}

module.exports = {
    listen: listen,
    connect: connect,
    register: register
};
