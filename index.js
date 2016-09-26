"use strict";
var url = require('url');

const adaptors = Object.create(null);

// returns some "handler object" that has .close() method
// and emits 'connection' event
function listen (stream_url, options, callback) {
    if (options && options.constructor===Function) {
        callback = options;
        options = undefined;
    }
    var u = url.parse(stream_url.toString());
    var proto = u.protocol.substr(0, u.protocol.length-1);
    var adaptor = adaptors[proto];
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
    var proto = u.protocol.substr(0, u.protocol.length-1);
    var adaptor = adaptors[proto];
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

adaptors['0'] = require('./src/zero.js');
adaptors.tcp = require('./src/tcp.js');
adaptors.std = require('./src/std.js');
adaptors.file = require('./src/file.js');

module.exports = {
    listen: listen,
    connect: connect,
    _adaptors: adaptors
};

