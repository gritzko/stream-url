"use strict";
var net = require('net');

function tcp_listen (url, options, callback) {
    var server = new net.createServer(options);
    if (!url.port) {
        throw new Error('please specify port number');
    }
    server.listen(url.port, url.hostname || '0.0.0.0');
    function on_listen() {
        server.removeListener('error', on_error);
        callback(null, server);
    }
    function on_error(err) {
        callback(err, null);
    }
    server.once('listening', on_listen);
    server.once('error', on_error);
    return server;
}

function tcp_connect (url, options, callback) {
    var stream = new net.Socket(options);

    var on_connect = function () {
        stream.removeListener('error', on_error);
        callback(null, stream);
    };
    var on_error = function (err) {
        stream.removeListener('connect', on_connect);
        callback(err, null);
    };

    stream.once('connect', on_connect);
    stream.once('error', on_error);
    stream.connect({
        port: url.port,
        host: url.hostname
    });
    return stream;
}

module.exports = {
    listen: tcp_listen,
    connect: tcp_connect
};