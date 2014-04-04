define(['underscore', 'backbone', 'models/basecollection', 'models/usergroup'], function (_, Backbone, BaseCollection, UserGroup) {
        var col = Backbone.Collection.extend({
            model: UserGroup,
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
            getById: function (value, callback) {
                var self = this;
                return self.getByAttribute('uuid', value, callback);
            }
        });
        return col;
    });