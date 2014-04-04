define(['underscore', 'backbone', 'models/basecollection', 'models/permission'], function (_, Backbone, BaseCollection, Permission) {
        var col = Backbone.Collection.extend({
            model: Permission,
            initialize: function () {
                var self = this;
                _.extend(self, BaseCollection);
                var model = new self.model();
                self.store = model.store;
                self.sync = model.sync;
            },
            filterByCode: function (value) {
                var self = this;
                return self.filterByAttribute('code', value);
            },
            filterByDestination: function (type, id) {
                var self = this;
                return self.filterByDestinationType(type).filterByDestinationId(id);
            },
            filterByDestinationId: function (value) {
                var self = this;
                return self.filterByAttribute('destId', value);
            },
            filterByDestinationType: function (value) {
                var self = this;
                return self.filterByAttribute('destType', value);
            },
            filterByEnabled: function (value) {
                var self = this;
                return self.filterByAttribute('enabled', value);
            },
            filterByHasCode: function (value) {
                var self = this;
                var filtered = self.filter(function (item) {
                    return (item.hasCode(value) == true);
                });
                return new self.constructor(filtered);
            },
            filterBySource: function (type, id) {
                var self = this;
                return self.filterBySourceType(type).filterBySourceId(id);
            },
            filterBySourceId: function (value) {
                var self = this;
                return self.filterByAttribute('srcId', value);
            },
            filterBySourceType: function (value) {
                var self = this;
                return self.filterByAttribute('srcType', value);
            },
            getByCode: function (value, callback) {
                var self = this;
                return self.getByAttribute('code', value, callback);
            },
            getById: function (value, callback) {
                var self = this;
                return self.getByAttribute('uuid', value, callback);
            },
            getByDestination: function (type, id, callback) {
                var self = this;
                self.getByDestinationType(type, function(items) {
                    var result = items.filterByDestinationId(id);
                    callback(result);
                });
            },
            getByDestinationType: function (value, callback) {
                var self = this;
                return self.getByAttribute('destType', value, callback);
            },
            getBySource: function (type, id, callback) {
                var self = this;
                self.getBySourceType(type, function(items) {
                    var result = items.filterBySourceId(id);
                    callback(result);
                });
            },
            getBySourceType: function (value, callback) {
                var self = this;
                return self.getByAttribute('srcType', value, callback);
            }
        });
        return col;
    });