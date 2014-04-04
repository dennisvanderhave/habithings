define(['models/apimodel'], function (ApiModel) {
    var model = ApiModel.extend({
        idAttribute: 'id', // id, name, icon, lastPoll
        path: 'devices',
        initialize: function () {
            var self = this;
        },
        setting: function (key, value) {
            var self = this;
            var settings = self.get('settings') || {};
            var valueCurrent = settings[key];
            if (value === null || value === undefined) {
                return valueCurrent;
            } else {
                if (value != valueCurrent) {
                    settings[key] = value;
                    self.set('settings', settings);
                }
                return value;
            }
        }
    });
    return model;
});
