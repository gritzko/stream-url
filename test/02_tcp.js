"use strict";
var su = require('stream-url');
require('..');

var tape = require('tape');
if (typeof(window)==='object') {
    var tape_dom = require('tape-dom');
    tape_dom.installCSS();
    tape_dom.stream(tape);
}

tape ('1.A create echo server', function (t) {
    var port = Math.floor(Math.random()*10000) + 2000;
    var url = 'tcp://localhost:'+port;
    t.plan(4);
    var tcp_server = su.listen(url, function ready(err, serv) {
        console.log('ready');
        serv.on('connection', function (stream) {
            console.log('conn in');
            stream.on('data', function (data) {
                console.log('data', data);
                stream.write(data);
            });
            stream.on('end', function () {
                t.pass('server stream ends');
                serv.close();
            });
        });
        var sock_outer = su.connect(url, function (err, sock) {
            console.log('connected');
            sock.on('data', function (data) {
                t.equal(''+data, 'test');
                sock.end(); // TODO on(end)
            });
            sock.write('test', function () {
                t.pass('sent');
            });
            sock.on('end', function () {
                t.pass('client stream ends');
                t.end();
            });
        });
    });
});

tape ('1.B listen fails', function (t) {
    t.plan(2);
    var server = su.listen('tcp://localhost:1', function on_fail(err, serv) {
        t.ok(err);
        t.equal(serv, null);
        t.end();
    });
});

tape ('1.C connect fails', function (t) {
    var url = 'tcp://localhost:1';
    var stream = su.connect(url, function (err, socket) {
        t.equal(err.code, 'ECONNREFUSED', 'Connection refused');
        t.notOk(socket, 'Socket parameter should be null');
        setTimeout(function () {
            t.end();
        }, 100);
    });
});

tape ('1.D connect and disconnect', function (t) {
    var port = Math.floor(Math.random()*10000) + 2000;
    var url = 'tcp://localhost:' + port;
    var tcp_server = su.listen(url, function ready (err, serv) {
        t.notOk(err, 'Expect no errors');
        t.equal(serv, tcp_server, 'Callback parameter is the server itself');

        serv.on('connection', function (stream) {
            t.pass('New incoming connection received');
            stream.end('something');
        });

        var client = su.connect(url, function (err, sock) {
            t.pass('Connection established');
            t.notOk(err, 'Expect no errors');
            t.equal(sock, client, 'Callback parameter is the stream itself');

            sock.on('data', function (data) {
                t.equal(data.toString(), 'something');
            });
            sock.on('end', function () {
                tcp_server.close();
                setTimeout(function () {
                    t.end();
                }, 100);
            });
        });
    });
});
