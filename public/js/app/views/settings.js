define(['underscore', 'views/baseview', 'views/input'], function (_, BaseView, Input) {
    return BaseView.extend({
        className: 'settingsview',
        template: function () {
            var self = this;
            var tpl = '';
            return tpl;
        },
        onInitialize: function (options) {
            var self = this;
        },
        onRender: function () {
            var self = this;

            var col = [];
            self.app.store.get('devices').each(function(device) {
                _.each(_.keys(device.get('triggers') || {}), function(trgKey) {
                    var field = device.get('fields')[trgKey];
                    if (field && field.label) {
                        var id = device.id + '|' + trgKey;
                        var icon = device.get('icon');
                        col.push({ id: id, icon: icon, label: field.label, label2: device.get('name') });
                    }
                });
            });
            var input = new Input({ type: 'list', items: col, label: 'Trigger' });
            input.on('input:change', function(args) { 
                if (args && args.value) { alert('Value changed: ' + args.value); }
            });
            var el = input.render().el;
            self.$el.append(el);


        }
    });
});