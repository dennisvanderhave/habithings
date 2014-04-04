define(['backbone', 'underscore'], function (Backbone, _) {
    return Backbone.Marionette.ItemView.extend({
        initialize: function (options) {
            var self = this;
            self.options = _.defaults(self.options, options, self.defaults) || {};
            self.app = require('app');
            self.bindAll(self);
            if (self.onInitialize) { self.onInitialize(); }
        },
        bindAll: function (obj) {
            var funcs = [];
            if (obj) {
                funcs = _.functions(obj);
            }
            funcs.splice(0, 0, obj);
            _.bindAll.apply(obj, funcs);
        },
        goTo: function (route, params) {
            if (Backbone.history.fragment == route) {
                Backbone.history.fragment = null;
            }
            if (params) {
                Backbone.history.navigate(route + '/' + params, true);
            } else {
                Backbone.history.navigate(route, true);
            }
        }
    });
});