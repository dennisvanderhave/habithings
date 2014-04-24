define(['underscore', 'backbone', 'moment',  'views/baseview', 'views/list', 'views/fieldinput', 'views/input', 'models/device'], function (_, Backbone, moment, BaseView, List, FieldInput, Input, Device) {
    return BaseView.extend({
        className: 'deviceaddview',
        events: {},
        ui: {},
        template: function () {
            var self = this;
            var tpl = '';

            tpl += '<div class="row">';
            tpl += '  <div data-id="info" class="col-xs-12">';
            tpl += '  <div>';
            tpl += '    <i class="icon icon-fw icon-lg icon-device"></i>';
            tpl += '    <span>Add new device</span>';
            tpl += '  </div>';
            tpl += '  </div>';
            tpl += '</div>';
            tpl += '<div data-id="list"></div>';

            return tpl;
        },
        onInitialize: function (options) {
            var self = this;
            
            // fields 
            self._fieldsList = new List({
                classStyle: 'liststyle1 form-horizontal',
                collection: new Backbone.Collection(),
                onItemRender: self.onListFieldItemRender,
                onItemAfterRender: self.onListFieldItemAfterRender
            });
           
        },
        showFields: function(items) {
            var self = this;
            var fields = [];

            if (_.contains(items, 'type')) { fields.push({ id: 'type', label: 'Type:' }); }
            if (_.contains(items, 'location')) { fields.push({ id: 'location', label: 'Location:' }); }
            if (_.contains(items, 'name')) { fields.push({ id: 'name', label: 'Name:' }); }

            if (_.contains(items, 'config')) { 
                var plugin = self.app.store.get('plugins').get(self._pluginId);
                var plgFields = (plugin) ? plugin.get('fields') : null;
                self._device.set('fields', plgFields);  
                if (plugin && plgFields) {
                    _.each(_.keys(plgFields), function(keyField) {
                        if (plgFields[keyField].config) {
                            fields.push({ id: 'config|' + keyField, label: plgFields[keyField].label + ':' });
                        }
                    });  
                }
            }

            if (_.contains(items, 'finish')) { fields.push({ id: 'finish', label: '' }); }
            self._fieldsList.collection.set(fields)
        },
        onListFieldItemRender: function (model) {
            var self = this;
            var tpl = '';
            tpl += '<div class="row">';
            tpl += '  <div data-col="label" class="col-xs-4"><span><strong>' + model.get('label') + '</strong></span></div>';
            tpl += '  <div data-col="input" class="col-xs-8"></div>';
            tpl += '</div>';
            return tpl;
        },
        onListFieldItemAfterRender: function (model, el) {
            var self = this;
            var input;
            if (model.id == 'type') {
                // plugins (device)
                var plugins = [];
                self.app.store.get('plugins').each(function(plugin) {
                    if (plugin.get('type') == 'device') {
                        var item = { id: plugin.get('id'), label: plugin.get('name'), icon: plugin.get('icon') };
                        plugins.push(item);
                    }
                });
                var opt = { type: 'list', items: plugins, label: model.get('label') };
                input = new Input(opt);
                input.on('input:change', function(args) { 
                    if (args && args.value) { 
                        var devicePlugin = self.app.store.get('plugins').get(args.value);
                        if (devicePlugin && devicePlugin.get('protocol')) {
                            // get all existing protocols we can connect to (and show parent device name)
                            var protocols = [];
                            self.app.store.get('protocols').filterByInterface(devicePlugin.get('protocol')).each(function(protocol) {
                                var parentDeviceId = protocol.get('deviceId');
                                var device = (parentDeviceId) ? self.app.store.get('devices').get(parentDeviceId) : null;
                                if (device) {
                                    var name = device.get('name');
                                    var item = { id: protocol.get('id'), label: name, icon: device.get('icon') };
                                    protocols.push(item);
                                }
                            });
                            self._pluginId = args.value;
                            self._protocols = protocols;
                        }
                    } else {
                        self._pluginId = null;
                        self._protocols = [];
                    }
                    if (self._protocols) {  
                        self.showFields(['type', 'location']);    
                    } else {
                        self.showFields(['type']);
                    }
                }, self);
            } else if (model.id == 'location') { 
                // the location (protocol) control
                var protocols = self._protocols || [];
                var opt = { type: 'list', items: protocols };
                input = new Input(opt);
                input.on('input:change', function(args) { 
                    if (args && args.value) { 
                        self._protocolId = args.value;
                        var name = self.app.store.get('plugins').get(self._pluginId).get('name') || '';
                        self._device = new Device({ name: name, pluginId: self._pluginId, protocolId: self._protocolId });
                        self.showFields(['type', 'location', 'name', 'config', 'finish']);    
                    } else {
                        self.showFields(['type', 'location']);
                    }
                }, self);   
            } else if (model.id == 'name') {
                // name
                var value = self._device.get('name') || '';
                input = new Input({ type: 'text', value: value });
                input.on('input:change', function(args) { 
                    if (args && args.value) { 
                        self._device.set('name', args.value);
                    }
                }, self); 
            } else if (model.id.indexOf('config|') == 0) {
                // configuration
                var field = model.id.split('|')[1];
                input = new FieldInput({ entity: self._device, field: field });

            } else if (model.id == 'finish') { 
                var inp = $('<button type="button" class="btn btn-success">Ok</button>');
                inp.on('click', function() {
                    //var name = self._deviceName || self.app.store.get('plugins').get(self._pluginId).get('name') || '';
                    //var device = new Device({ name: name, pluginId: self._pluginId, protocolId: self._protocolId });
                    self._device.save(null, {
                        success: function(result) {
                            if (result) { 
                                if (!self.app.store.get('devices').get(result.id)) { self.app.store.get('devices').add(result); }
                                self.goTo('deviceedit', 'id:' + result.id);  
                            }
                        }    
                    });
                });
                el.find('div[data-col="input"]').append(inp);
            }

            if (input) {
                var inp = input.render().el;
                el.find('div[data-col="input"]').append(inp);
            }
        },
        onRender: function () {
            var self = this;

            var inp = self._fieldsList.render().el;
            self.$el.find('div[data-id="list"]').append(inp);
            self.showFields(['type']);

        }
    });
});

