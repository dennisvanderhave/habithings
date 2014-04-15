define(['underscore', 'backbone', 'models/basecollection', 'models/plugin'], function (_, Backbone, BaseCollection, Plugin) {
        var col = Backbone.Collection.extend({
            model: Plugin,
            initialize: function () {
                var self = this;
                _.extend(self, BaseCollection);
                var model = new self.model();
                self.store = model.store;
                self.sync = model.sync;
            },
            filterByCode: function (value) {
                var self = this;
                var filtered = self.filter(function (item) {
                    return (item.plugin && item.plugin.code && item.plugin.code == value);
                });
                return new self.constructor(filtered);    
            },
            filterById: function (value) {
                var self = this;
                return self.filterByAttribute('uuid', value);
            },
            filterByProtocol: function (value) {
                var self = this;
                var filtered = self.filter(function (item) {
                    return (item.plugin && item.plugin.definition && item.plugin.definition.protocol && item.plugin.definition.protocol == value);
                });
                return new self.constructor(filtered);    
            },
            filterByType: function (value) {
                var self = this;
                return self.filterByAttribute('type', value);
            },
            getById: function (value, callback) {
                var self = this;
                return self.getByAttribute('uuid', value, callback);
            }
        });
        return col;
    });