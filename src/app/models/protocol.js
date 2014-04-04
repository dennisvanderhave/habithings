define(['backbone', 'backbone-store'], function (Backbone, BBStore) {
    var model = Backbone.Model.extend({
        // fields: uuid*, name*, pluginId*, deviceId*, interface*
        idAttribute: 'uuid',
        initialize: function () {
            var store = new BBStore(this, 'protocols');
        }
    });
    return model;
});
