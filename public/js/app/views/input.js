 define(['jquery', 'underscore', 'backbone', 'views/baseview', 'views/list'], function ($, _, Backbone, BaseView, List) {
    return BaseView.extend({
        inputTypes: [
            { id: 'list' },
            { id: 'number' },
            { id: 'text' },
            { id: 'trigger' }
        ],
        className: 'inputview',
        defaults: {
            items: [],
            viewType: 'normal', 
            type: 'text'
        },
        template: function () {
            var self = this;
            var tpl = '';
            return tpl;
        },
        setValue: function(val, silent) {
            var self = this;    
            var doChange = false;

            switch (self.options.type) {
                case 'list':
                    doChange = (self.value != val);
                    if (doChange) {
                        self.value = val;
                        self.label = (val && self._items.get(val)) ? self._items.get(val).get('label') : '';
                        self.$el.find('input').val(self.label);
                    }
                    break;
                case 'number':
                    doChange = (self.value != parseFloat(val));
                    if (doChange) {
                        self.value = parseFloat(val);
                        self.label = val;
                        self.$el.find('input').val(self.label);
                    }
                    break;
                case 'text':
                    doChange = (self.value != val);
                    if (doChange) {
                        self.value = val;
                        self.label = val;
                        self.$el.find('input').val(self.label);
                    }
                    break;
                case 'trigger':
                    doChange = (self.value != val);
                    if (doChange) {
                        self.value = val;
                        var valueId = (val) ? val.type + '|' + val.uuid + '|' + val.trigger : ''; 
                        self.label = (self._items.get(valueId)) ? self._items.get(valueId).get('label') : '';
                        self.$el.find('input').val(self.label);
                    }
                    break;
            }
            if (doChange && !silent) { 
                self.trigger('input:change', { value: self.value });    
            }
        },
        renderInput: function() {
            var self = this;
            var inp;

            switch (self.options.type) {
                case 'list':
                    self._items = new Backbone.Collection(self.options.items);
                    if (self.options.viewType == 'normal') {
                        var tpl = '';
                        tpl += '<div class="input-group">';
                        tpl += '  <input type="text" class="form-control" readonly>';
                        if (!self.options.readonly) { tpl += '  <span class="input-group-btn"><button class="btn btn-default" type="button"><i class="icon icon-fw icon-lg icon-edit"></i></button></span>'; }
                        tpl += '</div>';
                        inp = $(tpl);
                        inp.find('button').on('click', function() {
                            var opt = _.extend(_.omit(self.options, 'viewType'), { viewType: 'full' });
                            self.app.main.dialogInput(opt, function(result, value) {
                                if (result && value) {
                                    self.setValue(value);
                                }
                            });    
                        });
                    } else {
                        var hasIcons = (self._items.filter(function(item){ return (item.get('icon')); }).length > 0);
                        var hasLabel2 = (self._items.filter(function(item){ return (item.get('label2')); }).length > 0);
                        var _list = new List({
                            classStyle: 'liststyle1',
                            collection: self._items,
                            onItemRender: function(model) {
                                var icon = (hasIcons && model.get('icon')) ? '<i class="icon icon-fw icon-2x icon-' + model.get('icon') + '"></i>' : '';
                                var label2 = (hasLabel2 && model.get('label2')) ? '<span>' + model.get('label2') + '</span>' : '';
                                var tpl = '<div class="row">';
                                if (hasIcons && hasLabel2) {
                                    tpl += '  <div class="col-xs-2">' + icon + '</div><div class="col-xs-5"><span>' + model.get('label') + '</span></div><div class="col-xs-5"><span>' + model.get('label2') + '</span></div>';
                                } else if (hasIcons) {
                                    tpl += '  <div class="col-xs-2">' + icon + '</div><div class="col-xs-10"><span>' + model.get('label') + '</span></div>';
                                } else {
                                    tpl += '  <div class="col-xs-12"><span>' + model.get('label') + '</span></div>';
                                }
                                tpl += '</div>';   
                                return tpl;
                            },
                            onItemSelect: function(model) {
                                self.setValue(model.get('id'));
                            }
                        });
                        inp = _list.render().el;
                    }
                    break;
                case 'number':
                    var styleReadonly = (self.options.readonly) ? ' readonly' : '';
                    inp = $('<input type="text" class="form-control"' + styleReadonly + '>');
                    if (!self.options.readonly) {
                        inp.on('keyup', function() {
                            if (this.value != this.value.replace(/[^0-9\.]/g, '')) {
                               this.value = this.value.replace(/[^0-9\.]/g, '');
                            }
                        });
                        inp.on('change', function() {
                            self.setValue(inp[0].value);
                        });
                    }
                    break;
                case 'text':
                    var styleReadonly = (self.options.readonly) ? ' readonly' : '';
                    inp = $('<input type="text" class="form-control"' + styleReadonly + '>');
                    inp.on('change', function() {
                        self.setValue(inp[0].value);
                    });
                    break;
                case 'trigger':
                    var triggers = [];
                    self.app.store.get('devices').each(function(device) {
                        _.each(_.keys(device.get('triggers') || {}), function(trgKey) {
                            var field = device.get('fields')[trgKey];
                            if (field && field.label) {
                                if (!_.contains(self.options.exclude || [], device.id)) {
                                    var id = 'device|' + device.id + '|' + trgKey;
                                    var value = { type: 'device', uuid: device.id, trigger : trgKey };
                                    triggers.push({ id: id, icon: device.get('icon'), label: device.get('name') + ' - ' + field.label, value: value });
                                }
                            }
                        });
                    });
                    self.app.store.get('tasks').each(function(task) {
                        _.each(_.keys(task.get('triggers') || {}), function(trgKey) {
                            var field = task.get('fields')[trgKey];
                            if (field && field.label) {
                                if (!_.contains(self.options.exclude || [], task.id)) {
                                    var id = 'task|' + task.id + '|' + trgKey;
                                    var value = { type: 'task', uuid: task.id, trigger : trgKey };
                                    triggers.push({ id: id, icon: task.get('icon'), label: task.get('name') + ' - ' + field.label, value: value });
                                }
                            }
                        });
                    });
                    self._items = new Backbone.Collection(triggers);
                    if (self.options.viewType == 'normal') {
                        var tpl = '';
                        tpl += '<div class="input-group">';
                        tpl += '  <input type="text" class="form-control" readonly>';
                        if (!self.options.readonly) { tpl += '  <span class="input-group-btn"><button class="btn btn-default" type="button"><i class="icon icon-fw icon-lg icon-edit"></i></button></span>'; }
                        tpl += '</div>';
                        inp = $(tpl);
                        inp.find('button').on('click', function() {
                            var opt = _.extend(_.omit(self.options, 'viewType'), { viewType: 'full', label: 'Trigger' });
                            self.app.main.dialogInput(opt, function(result, value) {
                                if (result && value) {
                                    self.setValue(value);
                                }
                            });    
                        });
                    } else {
                        var hasIcons = (self._items.filter(function(item){ return (item.get('icon')); }).length > 0);
                        var hasLabel2 = (self._items.filter(function(item){ return (item.get('label2')); }).length > 0);
                        var _list = new List({
                            classStyle: 'liststyle1',
                            collection: self._items,
                            onItemRender: function(model) {
                                var icon = (hasIcons && model.get('icon')) ? '<i class="icon icon-fw icon-2x icon-' + model.get('icon') + '"></i>' : '';
                                var label2 = (hasLabel2 && model.get('label2')) ? '<span>' + model.get('label2') + '</span>' : '';
                                var tpl = '<div class="row">';
                                if (hasIcons && hasLabel2) {
                                    tpl += '  <div class="col-xs-2">' + icon + '</div><div class="col-xs-5"><span>' + model.get('label') + '</span></div><div class="col-xs-5"><span>' + model.get('label2') + '</span></div>';
                                } else if (hasIcons) {
                                    tpl += '  <div class="col-xs-2">' + icon + '</div><div class="col-xs-10"><span>' + model.get('label') + '</span></div>';
                                } else {
                                    tpl += '  <div class="col-xs-12"><span>' + model.get('label') + '</span></div>';
                                }
                                tpl += '</div>';   
                                return tpl;
                            },
                            onItemSelect: function(model) {
                                self.setValue(model.get('value'));
                            }
                        });
                        inp = _list.render().el;
                    }
                    break;
            }
            if (inp) {
                self.$el.append(inp);
                self.setValue(self.options.value, true);
            }
        },
        onInitialize: function () {
            var self = this;
        },
        onRender: function () {
            var self = this;

            var clsInput = 'inp-' + self.options.type;
            self.$el.addClass(clsInput);

            self.renderInput();

        }
    });
});