define(['underscore', 'backbone', 'models/basecollection'], function (_, Backbone, BaseCollection) {
    var mod = BaseCollection.extend({
        path: '',
        url: function() {
            var self = this;
            if (!self.basePath) {
                var app = require('app');
                var serverAddress = app.store.settings.get('server_address');
                var serverPort = app.store.settings.get('server_port');
                self.basePath = 'http://' + serverAddress + ':' + serverPort + '/api';
            }
            return self.basePath + '/' + self.path;
        },
        bindApi: function() {
            var self = this;
            var app = require('app');
            app.socket.bindApiCollection(self);
        }
    });
    return mod;
});
