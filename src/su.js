"use strict";
var url = require('url');

var adaptors;
if (typeof(window)==='object') {
    adaptors = window.stream_url_adaptors = window.stream_url_adaptors || {};
} else {
    adaptors = process.stream_url_adaptors = process.stream_url_adaptors || {};
}

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



module.exports = {
    listen: listen,
    connect: connect,
    register: register
};
