"use strict";
var util = require('util');
var EventEmitter = require('events').EventEmitter;

// Fake server for ZeroStreams.
function ZeroServer (url, options, callback) {
    EventEmitter.call(this);
    this.id = null;
    //this.streams = {};
    if (url) {
        this.listen(url, options, callback);
    }
}
util.inherits(ZeroServer, EventEmitter);
module.exports = ZeroServer;
ZeroServer.servers = {};

ZeroServer.prototype._zero_connect = function (zero_stream) {
    var self = this;
    setTimeout(function(){ // pretend to be async
        self.emit('connection', zero_stream);
    }, 1);
};

ZeroServer.prototype.listen = function (url, options, callback){
    if (this.id) {
        throw new Error('can listen one id only');
    }
    if (!url.hostname) {
        throw new Error('malformed id/url');
    }
    this.id = url.hostname;
    if (this.id in ZeroServer.servers) {
        throw new Error('id is taken already');
    }
    ZeroServer.servers[this.id] = this;
    callback(null, this);
};

ZeroServer.prototype.close = function (){
    delete ZeroServer.servers[this.id];
};
