define(['underscore', 'backbone', 'models/basecollection', 'models/task'], function (_, Backbone, BaseCollection, Task) {
        var col = Backbone.Collection.extend({
            model: Task,
            initialize: function () {
                var self = this;
                _.extend(self, BaseCollection);
                var model = new self.model();
                self.store = model.store;
                self.sync = model.sync;
            },
            //filterByInterface: function (value) {
            //    var self = this;
            //    return self.filterByAttribute('interface', value);
            //},
            filterByPluginId: function (value) {
                var self = this;
                return self.filterByAttribute('pluginId', value);
            },
            filterByTriggerLinks: function (type, uuid, trigger) {
                var self = this;
                var filtered = self.filter(function (item) {
                    var ret = false;
                    var fields = item.plugin.definition.fields || {};
                    var settings = item.get('settings') || {};
                    _.each(fields, function(value, key) {
                        if (value && value.trigger && settings[key] && settings[key].type == type && settings[key].uuid == uuid && settings[key].trigger == trigger) {
                            ret = true;
                        }
                    });
                    return ret;
                });
                return new self.constructor(filtered);
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