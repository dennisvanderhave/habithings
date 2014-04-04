define(['models/apicollection', 'models/task'], function (ApiCollection, Task) {
    var col = ApiCollection.extend({
        model: Task,
        path: 'tasks',
        comparator: function (model) {
            return model.get('name');
        },
        initialize: function () {
            var self = this;
        }
    });
    return col;
});