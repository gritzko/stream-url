"use strict";
var net = require('net');


function file_listen (url, options, callback) {
    var server = new net.createServer(options);
    if (!url.path) {
        throw new Error('please specify the path');
    }
    server.listen(url.path);
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


function file_connect (url, options, callback) {
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
    stream.connect(url.path);
    return stream;
}

module.exports = {

    listen: file_listen,
    connect: file_connect

};