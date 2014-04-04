define(['backbone', 'backbone-store'], function (Backbone, BBStore) {
    var model = Backbone.Model.extend({
        // fields: uuid*, name*, login*, pass*, enabled
        idAttribute: 'uuid',
        initialize: function () {
            var store = new BBStore(this, 'users');
        }
    });
    return model;
});
