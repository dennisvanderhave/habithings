define(['models/apicollection', 'models/plugin'], function (ApiCollection, Plugin) {
    var col = ApiCollection.extend({
        model: Plugin,
        path: 'plugins',
        comparator: function (model) {
            return model.get('name');
        },
        initialize: function () {
            var self = this;
        },
        filterByType: function (value) {
            var self = this;
            return self.filterByAttribute('type', value);
        }
    });
    return col;
});