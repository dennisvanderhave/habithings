define(['backbone', 'backbone-store'], function (Backbone, BBStore) {
    var model = Backbone.Model.extend({
        // fields: uuid*, name*, enabled
        idAttribute: 'uuid',
        initialize: function () {
            var store = new BBStore(this, 'usergroups');
        }
    });
    return model;
});
