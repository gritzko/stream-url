"use strict";
var su = require('..');

var tape = require('tape');
if (typeof(window)==='object') {
    var tape_dom = require('tape-dom');
    tape_dom.installCSS();
    tape_dom.stream(tape);
}

tape ('1.A listen-connect for direct-invocation streams', function (t) {
    var dummy_object = {dummy:'object'}, serv_rem;
    t.plan(8);
    var server = su.listen('0:string', function(err, serv) {
        serv_rem = serv;
        t.notOk(err, 'no errors');
        serv.on('connection', function(conn) {
            t.pass('incoming connection');
            conn.on('data', function (obj) {
                t.ok(obj===dummy_object, 'object received');
            });
            conn.write('OK');
            conn.end();
        });
    });
    t.ok(server===serv_rem);
    var one = su.connect('0:string', function (err, stream) {
        t.notOk(err);
        t.ok(one===stream);
        stream.on('data', function (data) {
            t.equal(data, 'OK', 'data match');
        });
        stream.on('end', function (){
            t.ok(true, 'stream ends'); // TODO
            t.end();
        });
        stream.write(dummy_object);
    });
});


tape ('1.B connect fail', function (t) {
    t.plan(2);
    su.connect('0:nonexisting', function (err, stream) {
        t.ok(err, 'got an error');
        t.notOk(stream, 'no stream');
    });
});
