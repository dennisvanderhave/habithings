define(['underscore', 'backbone', 'vent', 'views/baseview', 'views/list'], function (_, Backbone, vent, BaseView, List) {
    return BaseView.extend({
        className: 'menuview',
        events: {},
        modelEvents: {},
        ui: {},
        template: function () {
            var self = this;
            var tpl = '';

            return tpl;
        },
        onInitialize: function (options) {
            var self = this;

            self.options.viewmode = self.options.viewmode || 'main';

            var navItems = [];
            if (self.options.viewmode == 'main')  {
                navItems.push({ id: 'dashboard', icon: 'dashboard', label: 'Dashboard', link: 'dashboard' });
                navItems.push({ id: 'devices', icon: 'device', label: 'Devices', link: 'devices', alias: ['deviceedit'] });
                navItems.push({ id: 'tasks', icon: 'task', label: 'Tasks', link: 'tasks', alias: ['taskadd', 'taskedit'] });
                navItems.push({ id: 'settings', icon: 'gear', label: 'Settings', link: '' });
                navItems.push({ id: 'user', icon: 'user', label: 'User', link: '' });
            }
            
            self._list = new List({
                classStyle: 'menustyle' + self.options.viewmode,
                collection: new Backbone.Collection(navItems),
                onItemRender: self.onListItemRender,
                onItemSelect: self.onListItemSelect,
                scope: self
            });

            vent.on('app:view', function (name) {
                var items = self._list.collection;
                items.each(function(item) { 
                    var active = false;
                    if (item.get('link') && item.get('link') == name) { active = true; }
                    if (item.get('alias') && _.indexOf(item.get('alias'), name) >= 0) { active = true; }
                    item.set('active', active); 
                });
            });
        },
        onListItemRender: function (model) {
            var self = this;

            var icon = (model.get('icon')) ? ' icon-' + model.get('icon') : '';
            var tpl = '';
            tpl += '<div class="' + (model.get('active') ? 'menu-active' : '') + '">'
            tpl += '  <i class="icon icon-fw icon-lg' + icon + '"></i>';
            tpl += '  <span>' + model.get('label') + '</span>';
            tpl += '</div>'
            return tpl;
        },
        onListItemSelect: function (model) {
            var self = this;
            var id = model.get('id');
            var link = model.get('link');

            if (link) {
                self.trigger('menu:select');
                self.goTo(link);
            }
        },
        onRender: function () {
            var self = this;

            if (self.options.classStyle) { self.$el.addClass(self.options.classStyle); }

            if (self.$el.find('.listview').length <= 0) {
                self.$el.append(self._list.render().el);
            }

        }
    });
});