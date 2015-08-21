"use strict";
var url = require('url');
var ZeroServer = require('./ZeroServer');
var ZeroStream = require('./ZeroStream');

var adaptors;
if (typeof(window)==='object') {
    adaptors = window.stream_url_adaptors = window.stream_url_adaptors || {};
} else {
    adaptors = process.stream_url_adaptors = process.stream_url_adaptors || {};
}

// returns some "handler object" that has .close() method
// and emits 'connection' event
function listen (stream_url, options, callback) {
    if (options && options.constructor===Function) {
        callback = options;
        options = undefined;
    }
    var u = url.parse(stream_url.toString());
    var adaptor = adaptors[u.protocol];
    if (!adaptor) {
        throw new Error('protocol unknown: '+u.protocol);
    }
    return adaptor.listen(u, options, callback);
}

// returns a stream, either immediately or through the callback
function connect (stream_url, options, callback) {
    if (options && options.constructor===Function) {
        callback = options;
        options = undefined;
    }
    var u = url.parse(stream_url.toString());
    var adaptor = adaptors[u.protocol];
    if (!adaptor) {
        throw new Error('protocol unknown: '+u.protocol);
    }
    return adaptor.connect(u, options, callback);
}

function register (protocol, listen_handler, connect_handler) {
    adaptors[protocol] = {
        protocol: protocol,
        listen: listen_handler,
        connect: connect_handler
    };
}

var stream_url = module.exports = {
    listen: listen,
    connect: connect,
    register: register
};

stream_url.register('0:', zero_listen, zero_connect);

function zero_listen (stream_url, options, callback) {
    return new ZeroServer(stream_url, options, callback);
}

function zero_connect (stream_url, options, callback) {
    var stream = new ZeroStream();
    stream.connect(stream_url, options, callback);
    return stream;
}
