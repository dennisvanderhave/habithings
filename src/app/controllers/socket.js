define(['socket.io'], function(SocketIO) {
    var controller = function(app) {
        var self = this;
        self.app = app;
        self.funcs = app.get('main');
        self.auth = app.get('authorization');

        self.clients = [];

        var server = app.get('server');
        var io = SocketIO.listen(server, { log: false });
        //io.set('log level', 1);
        self.io = io;
        self.app.set('socketio', io);   

        io.sockets.on('connection', function (socket) {
            self.clients.push(socket.id);
            socket.on('disconnect', function() {
              var i = self.clients.indexOf(socket.id);
              self.clients.splice(i, 1);
            });          
        });
    };

    var exports = controller;
    return exports;
});
