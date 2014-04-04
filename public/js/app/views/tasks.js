define(['underscore', 'socketio', 'moment', 'views/baseview', 'views/list'], function (_, SocketIO, moment, BaseView, List) {
    return BaseView.extend({
        className: 'tasksview',
        events: {
            'click div.actionarea a[data-id]': 'onNavItemClick'
        },
        ui: {
            listarea: 'div.listarea'
        },
        template: function () {
            var self = this;
            var tpl = ''; 
            tpl += '<div class="actionarea navbarstyle2">';
            tpl += '  <ul class="nav nav-pills">';
            tpl += '    <li><a data-id="add" href="javascript:void(0)"><i class="icon icon-fw icon-lg icon-add"></i><span class="hidden-xs">Add new</span></a></li>';
            //tpl += '    <li><a data-id="discover" href="javascript:void(0)"><i class="icon icon-fw icon-lg icon-search"></i><span class="hidden-xs">Discover</span></a></li>';
            tpl += '  </ul>';
            tpl += '</div>';
            tpl += '<div class="listarea"></div>';
            return _.template(tpl);
        },
        onInitialize: function () {
            var self = this;

            self.collection = self.app.store.get('tasks');
            self._list = new List({
                classStyle: 'liststyle1',
                collection: self.collection,
                onItemOptionsRender: self.onListItemOptionsRender, 
                onItemRender: self.onListItemRender,
                onItemEvent: self.onListItemEvent,
                scope: self
            });
        },
        onListItemOptionsRender: function (model) {
            var self = this;
            var tpl = '';
            tpl += '<div class="opt-remove" data-id="remove"><span>Remove</span></div>';
            return tpl;            
        },
        onListItemRender: function (model) {
            var self = this;
            var tpl = '';
            var clsIcon = 'icon icon-fw icon-2x icon-' + model.get('icon');
            var lastSeen = ''; //moment().utc(model.get('lastActive')).fromNow(); 

            tpl += '<div class="row">';
            tpl += '  <div class="col-xs-2  col-sm-1" data-id="select"><i class="' + clsIcon + '"></i></div>';
            tpl += '  <div class="col-xs-10 col-sm-6" data-id="select"><span>' + model.get('name') + '</span></div>';
            tpl += '  <div class="hidden-xs col-sm-3" data-id="select"><span>' + lastSeen + '</span></div>';
            tpl += '  <div class="hidden-xs col-sm-2"><button type="button" data-id="remove" class="btn btn-danger">Remove</button></div>';
            tpl += '</div>';
            return tpl;
        },
        onListItemEvent: function (model, target, type) {
            var self = this;
            if (target.dataset.id == 'select' && type == 'tap') {
                self.goTo('taskedit', 'id:' + model.id);    
            } else if (target.dataset.id == 'remove' && type == 'tap') {
                model.destroy();
            }
        },
        onNavItemClick: function (e) {
            var self = this;
            var ct = e.currentTarget;
            if (ct.dataset && ct.dataset.id) {
                if (ct.dataset.id == 'add') {
                    self.goTo('taskadd'); 
                } else if (ct.dataset.id == 'discover') {
                    var options = { path: 'api/system/discover/tasks', type: 'GET'};
                    self.app.main.callServer(options, function(result) {
                        if (result) {
                            //alert('Ok');
                        } else {
                            alert('Failed!');
                        }
                    });
                }
            }
        },
        onRender: function () {
            var self = this;
            var App = require('app');

            if (!self.ui.listarea.html()) {
                self.ui.listarea.append(self._list.render().el);
            }
        }
    });
});