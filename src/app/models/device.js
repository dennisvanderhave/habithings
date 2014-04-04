define(['underscore', 'backbone', 'backbone-store'], function (_, Backbone, BBStore) {
    var model = Backbone.Model.extend({
        // fields: uuid*, name*, pluginId*, (protocolId, code), [values]
        idAttribute: 'uuid',
        initialize: function () {
            var store = new BBStore(this, 'devices');
        },
        compareSettings: function (settings, configOnly) {
            var self = this;
            var ret = true;
            var fields = (configOnly) ? self.getPluginFields('config', true) : self.getPluginFields();
            _.each(fields, function(field) {
                var setField = self.setting(field.id);  
                if (_.has(settings, field.id) && settings[field.id] != setField) {
                    ret = false;
                }
            });
            return ret;
        },
        getPluginFields: function (key, value) {
            var self = this;
            var ret = [];
            var fields = (self.plugin && self.plugin.definition) ? self.plugin.definition.fields : null;
            if (fields) {
                _.each(_.keys(fields), function(keyField) {
                    var field = fields[keyField];
                    if (key && _.has(field, key) && value != undefined && field[key] == value) {
                        ret.push(_.extend({ id: keyField }, field));
                    } else if (key && _.has(field, key) && value == undefined) {
                        ret.push(_.extend({ id: keyField }, field));
                    } else if (!key) {
                        ret.push(_.extend({ id: keyField }, field));
                    }
                });
            }
            return ret;
        }
    });
    return model;
});
