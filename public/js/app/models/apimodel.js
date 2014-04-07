define(['underscore', 'backbone', 'models/basemodel'], function (_, Backbone, BaseModel) {
    var mod = BaseModel.extend({
        path: '',
        url: function() {
            var self = this;
            if (!self.basePath) {
                var app = require('app');
                var serverAddress = app.store.settings.get('server_address');
                var serverPort = app.store.settings.get('server_port');
                self.basePath = 'http://' + serverAddress + ':' + serverPort + '/api';
            }
            var ext = (self.id) ? '/' + self.id : '';
            return self.basePath + '/' + self.path + ext;
        }
    });
    return mod;
});
