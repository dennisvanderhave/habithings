define(['backbone', 'backbone-store'], function (Backbone, BBStore) {
    var model = Backbone.Model.extend({
        // fields: uuid*, name*, type, origin, location, enabled
        idAttribute: 'uuid',
        initialize: function () {
            var store = new BBStore(this, 'plugins');
        }
    });
    return model;
});
