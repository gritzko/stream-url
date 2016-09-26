
const Duplex = require('stream').Duplex;
class Duplexer extends Duplex {

    constructor (reader, writer) {
        super({allowHalfOpen: false});
        this.reader = reader;
        this.writer = writer;
        this._read_cb = data=>this.push(data);
        this._end_cb = ()=>this.push(null);
        this.reader.on('data', this._read_cb);
        this.reader.on('close', this._end_cb);
    }

    _write(chunk, encoding, callback) {
        console.log('W', chunk);
        this.writer.write(chunk, encoding, callback);
    }

    _read(size) {
    }

    end () {
        this.reader.pause();
        super.end();
    }

}


function std_listen (url, options, callback) {
    let stdio_stream = new Duplexer(process.stdin, process.stdout);
    const serv = {
        on: function (evname, cb) {
            if (evname==='connection')
                cb(stdio_stream);
        }
    };
    callback && callback(null, serv);
    return serv;
}


function std_connect (url, options, callback) {
    let stdio_stream = new Duplexer(process.stdin, process.stdout);
    callback(null, stdio_stream);
}


module.exports = {

    listen: std_listen,
    connect: std_connect

};