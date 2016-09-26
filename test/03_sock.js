"use strict";
var su = require('..');
var fs = require('fs');
var tape = require('tape');

tape ('3.A listen, connect, end', function (t) {

    const path = '/tmp/.test_sock.3A';
    const url = 'file://' + path;

    if (fs.existsSync(path))
        fs.unlinkSync(path);

    const sock_server = su.listen(url, err => {
        if (err) return console.error(err);
        su.connect(url, (err, stream) => {
            if (err) return console.error(err);
            stream.on('data', hello => {
                t.equals(hello.toString(), 'HELLO\n')
                t.end();
                sock_server.close();
            });
            stream.write('HELLO\n');
            stream.end();
        } );
    });

    sock_server.on('connection', stream => {
        stream.on('data', data => {
            stream.write(data);
        } );
    });

});