define(['models/apimodel'], function (ApiModel) {
    var model = ApiModel.extend({
        idAttribute: 'id', // id, name, icon
        path: 'tasks',
        initialize: function () {
            var self = this;
        },
        link: function (key, value) {
            var self = this;
            var links = self.get('links') || {};
            var valueCurrent = links[key];
            if (value === null || value === undefined) {
                return valueCurrent;
            } else {
                if (value != valueCurrent) {
                    links[key] = value;
                    self.set('links', links);
                }
                return value;
            }
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
