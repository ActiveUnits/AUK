var EventEmitter = require('events').EventEmitter;
var Hash = require('./hash');

module.exports = RemoteEmitter;
function RemoteEmitter (instance) {
    if (instance !== undefined) {
        instance.__proto__ = new RemoteEmitter;
        return instance;
    }
}
RemoteEmitter.RemoteEmitter = RemoteEmitter;
RemoteEmitter.prototype = new EventEmitter;

RemoteEmitter.prototype.once = function (name, cb) {
    this.on(name, function f () {
        cb.apply(this, arguments);
        this.removeListener(name, f);
    });
};

RemoteEmitter.prototype.subscribe = function () {
    throw new Error('subscribe() called on unattached object');
};

RemoteEmitter.prototype.tie = function () {
    throw new Error('tie() called on unattached object');
};

// Attach a connection to any remote emitters in an object
RemoteEmitter.prototype.attach = function (conn) {
    var self = this;
    if (!self._events) self._events = {};
    var copy = Hash.copy(self);
    if (!self.connections) self.connections = 0;
    self.connections ++;
    
    if (self.connections == 1) self.emit('_online');
    
    conn.on('end', function () {
        self.connections --;
        if (self.connections == 0) self.emit('_offline');
    });
    
    // Make a copy so we can add prototypes on the fly >:D
    // DNode clients won't see the methods we add.
    copy.__proto__ = Hash.copy(copy.__proto__);
    copy.__proto__.connection = conn;
    copy.__proto__.tie = function (rem) {
        if (typeof rem == 'string') {
            copy[rem] = RemoteEmitter.attach(conn, copy[rem]);
            return copy[rem];
        }
        else {
            return rem.attach(conn);
        }
    };
    copy.__proto__.tieArray = function (rems) {
        return rems.map(function (rem) { return rem.attach(conn) });
    };
    copy.__proto__.tieHash = function (rems) {
        return Hash.map(rems, function (rem) { return rem.attach(conn) });
    };
    
    copy.subscribe = function (cb) {
        var events = {};
        
        var ev = {
            on : function (name, f) {
                if (!(name in events)) events[name] = [];
                events[name].push(f);
                // note: might need to check if the connection is still alive inside
                // the callback
                self.on(name, f);
            },
            off : function (name, f) {
                if (f === undefined) {
                    // remove all listeners with the given name
                    if (events[name]) {
                        events[name].forEach(function (f) {
                            self.removeListener(name, f);
                        });
                        events[name] = [];
                    }
                }
                else {
                    var i = events[name].indexOf(f);
                    if (i >= 0) events[name].splice(i,1);
                    self.removeListener(name, f);
                }
            },
            once : function (name, f) {
                ev.on(name, function g () {
                    ev.off(name, g);
                    f.apply(ev, arguments);
                });
            }
        };
        ev.removeListener = ev.off;
        
        conn.on('end', function () {
            Object.keys(events).forEach(function (name) {
                events[name].forEach(function (f) {
                    ev.off(name, f);
                });
            });
        });
        
        cb(ev);
    };
    
    // emit before so server code can add stuff before it gets to the client
    self.emit('attach', copy);
    
    return copy;
};

RemoteEmitter.attach = function (conn, xs) {
    if (Array.isArray(xs)) {
        return xs.map(function (x) { x.attach(conn) });
    }
    else if (xs instanceof RemoteEmitter) {
        return xs.attach(conn);
    }
    else {
        return Hash.map(xs, function (x) { return x.attach(conn) });
    }
};

