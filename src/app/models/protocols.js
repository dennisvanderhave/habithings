define(['underscore', 'backbone', 'models/basecollection', 'models/protocol'], function (_, Backbone, BaseCollection, Protocol) {
        var col = Backbone.Collection.extend({
            model: Protocol,
            initialize: function () {
                var self = this;
                _.extend(self, BaseCollection);
                var model = new self.model();
                self.store = model.store;
                self.sync = model.sync;
            },
            filterByDeviceId: function (value) {
                var self = this;
                return self.filterByAttribute('deviceId', value);
            },
            filterById: function (value) {
                var self = this;
                return self.filterByAttribute('uuid', value);
            },
            filterByInterface: function (value) {
                var self = this;
                return self.filterByAttribute('interface', value);
            },
            filterByPluginId: function (value) {
                var self = this;
                return self.filterByAttribute('pluginId', value);
            },
            getById: function (value, callback) {
                var self = this;
                return self.getByAttribute('uuid', value, callback);
            },
            getByDeviceId: function (value, callback) {
                var self = this;
                return self.getByAttribute('deviceId', value, callback);
            }
        });
        return col;
    });