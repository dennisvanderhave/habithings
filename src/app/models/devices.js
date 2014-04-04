define(['underscore', 'backbone', 'models/basecollection', 'models/device'], function (_, Backbone, BaseCollection, Device) {
        var col = Backbone.Collection.extend({
            model: Device,
            initialize: function () {
                var self = this;
                _.extend(self, BaseCollection);
                var model = new self.model();
                self.store = model.store;
                self.sync = model.sync;
            },
            //filterByConfigHash: function (value) {
            //    var self = this;
            //    return self.filterByAttribute('configHash', value);
            //},
            filterByPluginId: function (value) {
                var self = this;
                return self.filterByAttribute('pluginId', value);
            },
            filterByProtocolId: function (value) {
                var self = this;
                return self.filterByAttribute('protocolId', value);
            },
            getById: function (value, callback) {
                var self = this;
                return self.getByAttribute('uuid', value, callback);
            },
            getByPluginId: function (value, callback) {
                var self = this;
                return self.getByAttribute('pluginId', value, callback);
            }
        });
        return col;
    });