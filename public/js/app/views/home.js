define(['underscore', 'views/baseview'], function (_, BaseView) {
    return BaseView.extend({
        className: 'homeview',
        template: function () {
            var self = this;
            var tpl = '';
            return _.template(tpl);
        },
        onInitialize: function () {
            var self = this;
        },
        onRender: function () {
            var self = this;

            self.app.main.isAuthenticated(function(err, result) {
                if (result) {
                    self.goTo('devices');
                } else {
                    self.goTo('login');
                }
            });
        }
    });
});