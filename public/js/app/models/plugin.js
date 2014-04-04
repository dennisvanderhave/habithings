define(['models/apimodel'], function (ApiModel) {
    var model = ApiModel.extend({
        idAttribute: 'id', // id, name, icon
        path: 'plugins',
        initialize: function () {
            var self = this;
        }
    });
    return model;
});
