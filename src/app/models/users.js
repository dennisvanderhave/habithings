define(['underscore', 'backbone', 'models/basecollection', 'models/user'], function (_, Backbone, BaseCollection, User) {
        var col = Backbone.Collection.extend({
            model: User,
            initialize: function () {
                var self = this;
                _.extend(self, BaseCollection);
                var model = new self.model();
                self.store = model.store;
                self.sync = model.sync;
            },
            filterByEnabled: function (value) {
                var self = this;
                return self.filterByAttribute('enabled', value);
            },
            filterByLogin: function (value) {
                var self = this;
                return self.filterByAttribute('login', value);
            },
            getByLogin: function (value, callback) {
                var self = this;
                return self.getByAttribute('login', value, callback);
            },
            getById: function (value, callback) {
                var self = this;
                return self.getByAttribute('uuid', value, callback);
            }
        });
        return col;
    });