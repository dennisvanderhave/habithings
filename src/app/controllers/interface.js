define(['underscore'], function(_) {
    var controller = function(app) {
        var self = this;
        self.app = app;

        self.auth = app.get('authorization');
        self.funcs = app.get('main');
        self.socket = app.get('socket');
    };

    controller.prototype.SocketSend = function(msg, args) {
        var self = this;
        var clientsIds = self.socket.clients;
        var sockets = self.socket.io.sockets.sockets;

        args = args || {};
        _.each(clientsIds, function(clientId) {
            var socket = sockets[clientId];
            if (socket) {
                var userId = (socket.handshake && socket.handshake.user && socket.handshake.user.id) ? socket.handshake.user.id : 0;
                var allowed = false;
                // check authorization
                if (msg == 'api:devices' && args.id) {
                    allowed = self.auth.checkUserPermission('view', userId, 'device', args.id);
                } else if (msg == 'api:tasks' && args.id) {
                    allowed = self.auth.checkUserPermission('view', userId, 'task', args.id);
                }
                // emit
                if (allowed) {
                    socket.emit(msg, args);
                }
            }
        });
    }

    controller.prototype.AddDevice = function(userId, data, callback) {
        var self = this;
        var result;

        // check authorization
        var allowed = self.auth.checkUserPermission('admin', userId, 'device', 'all');
        if (!allowed) { return false; }

        // create device
        if (data && data.name && data.protocolId && data.pluginId) {
            //var opt = { name: data.name, pluginId: data.pluginId, protocolId: data.protocolId };
            self.funcs.initDevice(data, function(model) {
                if (model) {
                    var uuid = model.get('uuid');    
                    var device = self.GetDevice(userId, uuid);
                    if (callback) { callback(device); }
                } else {
                    if (callback) { callback(); }
                }
            });
        }
    }
    controller.prototype.DeleteDevice = function(userId, id) {
        var self = this;

        // check authorization
        var allowed = self.auth.checkUserPermission('admin', userId, 'device', id);
        if (allowed) {
            self.funcs.doMessageBus('device', id, 'remove');
            return true;
        } else {
            return false;
        }
    }
    controller.prototype.GetDevice = function(userId, id) {
        var self = this;
        var result;

        // check authorization
        var allowed = self.auth.checkUserPermission('view', userId, 'device', id);

        // get device
        var device = self.funcs.devices.get(id);
        if (device && allowed) {
            var dev_fields = device.plugin.definition.fields || {};
            var dev_settings = _.pick(device.get('settings') || {}, _.keys(dev_fields));
            result = { 
                // device info
                id: device.get('uuid'), 
                name: device.get('name'), 
                // status info
                active: device.status('active') || false,
                lastActive: device.status('activeTimestamp'),
                lastPoll: device.status('pollTimestamp'),
                // plugin info
                icon: device.plugin.definition.icon || 'device',
                version: device.plugin.definition.version,
                manufacturer: device.plugin.definition.manufacturer,
                protocol: device.plugin.definition.protocol,
                fields: dev_fields,
                commands: device.plugin.definition.commands || {},
                triggers: device.plugin.definition.triggers || {},
                // settings
                settings: dev_settings
            }
        }
        return result;
    }
    controller.prototype.GetDevices = function(userId) {
        var self = this;
        var result = [];

        self.funcs.devices.each(function(device) { 
            var obj = self.GetDevice(userId, device.id);
            if (obj) { result.push(obj); }
        });
        return result;

    }
    controller.prototype.UpdateDevice = function(userId, id, data, callback) {
        var self = this;
        var result;

        // check authorization
        var allowed = self.auth.checkUserPermission('edit', userId, 'device', 'all');
        if (!allowed) { return false; }

        // update device
        var device = self.funcs.devices.get(id);
        if (device && data) {
            if (data.name) { device.attribute('name', data.name); }
            var settings = data.settings || {};
            _.each(_.keys(settings), function(key) {
                device.setting(key, settings[key]);
            });
            result = self.GetDevice(userId, id);
            if (callback) { callback(result); }
        } else {
            if (callback) { callback(); }
        }
    }
    controller.prototype.SystemDiscover = function(userId, type) {
        var self = this;

        // check authorization
        var allowed = self.auth.checkUserPermission('execute', userId, 'system', 'system');
        if (allowed) {
            self.funcs.doMessageBus('system', 'system', 'discover:' + type);
            return true;
        } else {
            return false;
        }
    }

    controller.prototype.GetPlugin = function(userId, id) {
        var self = this;
        var result;

        // check authorization
        var allowed = self.auth.checkUserPermission('view', userId, 'plugin', id);

        // get plugin
        var plugin = self.funcs.plugins.get(id);
        if (plugin && allowed) {
            var dev_fields = plugin.plugin.definition.fields || {};
            result = { 
                // info
                id: plugin.get('uuid'), 
                name: plugin.get('name'), 
                type: plugin.get('type'), 
                enabled: plugin.get('enabled'),
                // plugin info
                icon: plugin.plugin.definition.icon || 'plugin',
                version: plugin.plugin.definition.version || '',
                manufacturer: plugin.plugin.definition.manufacturer || '',
                protocol: plugin.plugin.definition.protocol || '',
                fields: dev_fields
            }
        }
        return result;
    }
    controller.prototype.GetPlugins = function(userId) {
        var self = this;
        var result = [];

        self.funcs.plugins.each(function(plugin) { 
            var obj = self.GetPlugin(userId, plugin.id);
            if (obj) { result.push(obj); }
        });
        return result;

    }

    controller.prototype.GetProtocol = function(userId, id) {
        var self = this;
        var result;

        // check authorization
        var allowed = self.auth.checkUserPermission('view', userId, 'protocol', id);

        // get protocol
        var protocol = self.funcs.protocols.get(id);
        if (protocol && allowed) {
            result = { 
                // info
                id: protocol.get('uuid'), 
                name: protocol.get('name'), 
                deviceId: protocol.get('deviceId'), 
                'interface': protocol.get('interface'), 
                // plugin info
                //      pluginId: protocol.plugin.definition.uuid,
                code: protocol.plugin.code,
                icon: protocol.plugin.definition.icon || 'protocol',
                version: protocol.plugin.definition.version,
            }
        }
        return result;
    }
    controller.prototype.GetProtocols = function(userId) {
        var self = this;
        var result = [];

        self.funcs.protocols.each(function(protocol) { 
            var obj = self.GetProtocol(userId, protocol.id);
            if (obj) { result.push(obj); }
        });
        return result;

    }

    controller.prototype.AddTask = function(userId, data, callback) {
        var self = this;
        var result;

        // check authorization
        var allowed = self.auth.checkUserPermission('admin', userId, 'task', 'all');
        if (!allowed) { return false; }

        // create task
        if (data && data.name && data.pluginId) {
            var opt = { name: data.name, pluginId: data.pluginId };
            self.funcs.initTask(opt, function(model) {
                if (model) {
                    var uuid = model.get('uuid');    
                    var task = self.GetTask(userId, uuid);
                    if (callback) { callback(task); }
                } else {
                    if (callback) { callback(); }
                }
            });
        }
    }
    controller.prototype.DeleteTask = function(userId, id) {
        var self = this;

        // check authorization
        var allowed = self.auth.checkUserPermission('admin', userId, 'task', id);
        if (allowed) {
            self.funcs.doMessageBus('task', id, 'remove');
            return true;
        } else {
            return false;
        }
    }
    controller.prototype.GetTask = function(userId, id) {
        var self = this;
        var result;

        // check authorization
        var allowed = self.auth.checkUserPermission('view', userId, 'task', id);

        // get task
        var task = self.funcs.tasks.get(id);
        if (task && allowed) {
            var tsk_fields = task.plugin.definition.fields || {};
            _.each(tsk_fields, function(field) {
                if (field.select && task.plugin.functions && task.plugin.functions[field.select]) {
                    var select = task.plugin.functions[field.select]();
                    field.select = select;
                }
            });

            result = { 
                // task info
                id: task.get('uuid'), 
                name: task.get('name'), 
                //// status info
                //active: device.status('active') || false,
                //lastActive: device.status('activeTimestamp'),
                //lastPoll: device.status('pollTimestamp'),
                // plugin info
                icon: task.plugin.definition.icon || 'task',
                version: task.plugin.definition.version,
                // others
                fields: tsk_fields,
                links: task.get('links') || {},
                settings: _.pick(task.get('settings') || {}, _.keys(tsk_fields)),
                triggers: task.plugin.definition.triggers || {},
            }
        }
        return result;
    }
    controller.prototype.GetTasks = function(userId) {
        var self = this;
        var result = [];

        self.funcs.tasks.each(function(task) { 
            var obj = self.GetTask(userId, task.id);
            if (obj) { result.push(obj); }
        });
        return result;

    }
    controller.prototype.UpdateTask = function(userId, id, data, callback) {
        var self = this;
        var result;

        // check authorization
        var allowed = self.auth.checkUserPermission('edit', userId, 'task', 'all');
        if (!allowed) { return false; }

        // update task
        var task = self.funcs.tasks.get(id);
        if (task && data) {
            if (data.name) { task.attribute('name', data.name); }
            var links = data.links || {};
            _.each(_.keys(links), function(key) {
                task.link(key, links[key]);
            });
            var settings = data.settings || {};
            var fields = task.plugin.definition.fields || {};
            _.each(_.keys(settings), function(key) {
                if (fields[key] && (fields[key].trigger || fields[key].editable)) {
                    task.setting(key, settings[key]);
                }
            });
            result = self.GetTask(userId, id);
            if (callback) { callback(result); }
        } else {
            if (callback) { callback(); }
        }
    }

    var exports = controller;
    return exports;
});
