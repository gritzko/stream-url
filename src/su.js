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

    if (options && options.reconnect) {
        var connector = {
            stream: null,
            connecting: false,
            enabled: true,
            retries: 0,
            minDelay: options.reconnect.minDelay || 1000,
            currentDelay: 0,
            callback: function (err, stream) {
                connector.connecting = false;
                if (!err) {
                    connector.stream = stream;
                    stream.once('close', function () {
                        connector.stream = null;
                        connector._connect();
                    });
                    callback(null, stream);
                } else {
                    connector.retries += 1;
                    if (options.reconnect.maxRetries &&
                        connector.retries >= options.reconnect.maxRetries) {
                       connector.enabled = false;
                       callback(err, null);
                    } else {
                        connector.reconnect();
                    }
                }
            },
            connect: function () {
                connector.enabled = true;
                connector.retries = 0;
                connector.currentDelay = connector.minDelay;
                return connector._connect();
            },
            _connect: function () {
                if (!connector.enabled)
                    return;
                if (connector.stream) {
                    connector.stream.end();
                } else if (!connector.connecting) {
                    connector.connecting = true;
                    adaptor.connect(u, options, connector.callback);
                } else {
                    // already in progress
                }
            },
            reconnect: function () {
                var timeout = Math.random() * (connector.currentDelay - connector.minDelay) +
                              connector.minDelay;
                connector.currentDelay *= 2;
                setTimeout(function () {
                    connector._connect();
                }, timeout);
            },
            disable: function () {
                connector.enabled = false;
                return connector;
            },
        };
        connector.connect();
        return connector;
    } else {
        return adaptor.connect(u, options, callback);
    }
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
