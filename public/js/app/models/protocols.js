define(['models/apicollection', 'models/protocol'], function (ApiCollection, Protocol) {
    var col = ApiCollection.extend({
        model: Protocol,
        path: 'protocols',
        comparator: function (model) {
            return model.get('name');
        },
        initialize: function () {
            var self = this;
        },
        filterByInterface: function (value) {
            var self = this;
            return self.filterByAttribute('interface', value);
        }
    });
    return col;
});