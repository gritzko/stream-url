"use strict";
var su = require('..');
var tape = require('tape');

tape ('4.A listen, connect, end', function (t) {

    t.ok(true);

    su.connect('std:', (err, stream) => {
        stream.write('Hello ');
        stream.write('world!\n');
        stream.end();
    });
    t.end();

});