define(['underscore', 'backbone', 'marionette', 'socketio'], function (_, Backbone, Marionette, SocketIO) {
    return Backbone.Marionette.Controller.extend({
        initialize: function (options) {
            var self = this;
            self._app = require('app');
            self._serverAddress = self._app.store.settings.get('server_address');
            self._serverPort = self._app.store.settings.get('server_port');
            self._serverUri = 'http://' + self._serverAddress + ':' + self._serverPort;
            self.connect();
        },
        bindApiCollection: function(collection) {
            var self = this;        
            var path = (collection && collection.path) ? collection.path : '';
            if (path) {
                self._socket.on('api:' + path, function (data) {
                    if (data.id && data.type == 'add') {
                        new collection.model({ id: data.id }).fetch({
                            success: function (model) {  
                                if (model) { 
                                    collection.set(model, { remove: false }); 
                                }
                            }   
                        });
                    } else if (data.id && data.type == 'change') {
                        new collection.model({ id: data.id }).fetch({
                            success: function (model) {  
                                if (model) { 
                                    collection.set(model, { remove: false }); 
                                }
                            }   
                        });
                    } else if (data.id && data.type == 'remove') {
                        var model = collection.get(data.id);
                        if (model) { collection.remove(model); }
                    } else {
                        collection.fetch();
                    }
                });                
            }
        },
        connect: function() {
            var self = this;
            self._socket = SocketIO.connect(self._serverUri);
        }

    });
});