"use strict";
var ZeroServer = require('./ZeroServer');
var url_pkg = require('url');

// Direct invocation stream simply passes objects to the
// listeners of its paired stream with no serialization or parsing.
// No stream stream, in a sense. Connects local objects.
// ZeroStream only supports one listener (it is not a proper EventEmitter).
function ZeroStream (pair) {
    if (pair) {
        this.pair = pair;
    } else {
        this.pair = new ZeroStream(this);
    }
    this._on_data = this.on_end = this.on_error = this.on_connect = null;
    this.data = [];
}
module.exports = ZeroStream;
// TODO OpStream hook:  data is an Op !!!!!!!!!!!!!!!

ZeroStream.prototype.on = function (event, callback) {
    switch (event) {
    case "data":
        this.on_data = callback;
        while (this.data.length) { // fake buffering
            callback(this.data.shift());
        }
    break;
    case "connect":    this.on_connect = callback;    break;
    case "end":        this.on_end = callback;        break;
    case "error":      /* never happens */            break;
    default:
        throw new Error('unsupported event');
    }
};

ZeroStream.prototype.write = function (something, nothing, callback) {
    if (something!==undefined && something!==null) {
        if (this.pair.on_data) {
            this.pair.on_data(something);
        } else {
            if (this.pair.data.length>100) {
                throw new Error('fake buffer overflow');
            }
            this.pair.data.push(something); // buffer
        }
    }
    if (nothing && nothing.constructor===Function) {
        callback = nothing;
    }
    if (callback) {
        callback();
    }
};

ZeroStream.prototype.end = function (something, nothing, callback) {
    if (something) {
        if (something.constructor!==Function) {
            this.write(something);
        } else {
            callback = something;
        }
    }
    if (this.pair.on_end) {
        this.pair.on_end();
    }
    if (nothing && nothing.constructor===Function) {
        callback = nothing;
    }
    if (callback) {
        callback();
    }
};

ZeroStream.prototype.connect = function (url, options, callback) {
    if (url.constructor===String) {
        url = url_pkg.parse(url);
    }
    if (!url.hostname) {
        throw new Error('invalid URL');
    }
    var srv_id = url.hostname, attempt = 0, self=this;

    function connect_to_server(){
        var srv = ZeroServer.servers[srv_id];
        if (!srv) {
            if (++attempt<10) {
                setTimeout(connect_to_server, 10);
            } else {
                console.error('server not known: '+srv_id);
                if (callback) {
                    callback("server not known");
                }
            }
        } else {
            srv._zero_connect(self.pair);
            if (callback) {
                callback(null, self);
            }
            if (self.on_connect) {
                self.on_connect(self);
            }
        }
    }

    setTimeout(connect_to_server, 1);

};
