define(['underscore', 'backbone', 'moment', 'views/baseview', 'views/list', 'views/input', 'models/task'], function (_, Backbone, moment, BaseView, List, Input, Task) {
    return BaseView.extend({
        className: 'taskaddview',
        events: {},
        ui: {},
        template: function () {
            var self = this;
            var tpl = '';

            tpl += '<div class="row">';
            tpl += '  <div data-id="info" class="col-xs-12">';
            tpl += '  <div>';
            tpl += '    <i class="icon icon-fw icon-lg icon-task"></i>';
            tpl += '    <span>Add new task</span>';
            tpl += '  </div>';
            tpl += '  </div>';
            tpl += '</div>';
            tpl += '<div data-id="list"></div>';
            return tpl;
        },
        onInitialize: function (options) {
            var self = this;
            
            // task plugins
            var plugins = [];
            self.app.store.get('plugins').each(function(plugin) {
                if (plugin.get('type') == 'task') {
                    var item = { id: plugin.get('id'), label: plugin.get('name'), icon: plugin.get('icon') };
                    plugins.push(item);
                }
            });
            var opt = { type: 'list', items: plugins, viewType: 'full' };
            self._inputPlugins = new Input(opt);
            self._inputPlugins.on('input:change', function(args) { 
                if (args && args.value) { 
                    var plugin = self.app.store.get('plugins').get(args.value);
                    if (plugin) {
                        var task = new Task({ name: plugin.get('name'), pluginId: plugin.get('id') });
                        task.save(null, {
                            success: function(result) {
                                if (result) { 
                                    if (!self.app.store.get('tasks').get(result.id)) { self.app.store.get('tasks').add(result); }
                                    self.goTo('taskedit', 'id:' + result.id);  
                                }
                            }    
                        });
                    }
                }
            }, self);

        },
        onRender: function () {
            var self = this;

            var inp = self._inputPlugins.render().el;
            self.$el.find('div[data-id="list"]').append(inp);

        }
    });
});
