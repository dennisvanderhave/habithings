define(['models/apicollection', 'models/device'], function (ApiCollection, Device) {
    var col = ApiCollection.extend({
        model: Device,
        path: 'devices',
        comparator: function (model) {
            return model.get('name');
        },
        initialize: function () {
            var self = this;
        }
    });
    return col;
});