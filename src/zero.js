var ZeroServer = require('./ZeroServer');
var ZeroStream = require('./ZeroStream');

function zero_listen (stream_url, options, callback) {
    return new ZeroServer(stream_url, options, callback);
}

function zero_connect (stream_url, options, callback) {
    var stream = new ZeroStream();
    stream.connect(stream_url, options, callback);
    return stream;
}

module.exports = {
    listen: zero_listen,
    connect: zero_connect
};
