define(['underscore', 'models/plugins', 'models/protocols', 'models/devices', 'models/tasks', 'models/permissions', 'models/usergroups', 'models/users'], function(_, Plugins, Protocols, Devices, Tasks, Permissions, UserGroups, Users) {
    var controller = function(app) {
        var self = this;

        self.app = app;
        self.plugins = new Plugins();
        self.protocols = new Protocols();
        self.devices = new Devices();
        self.tasks = new Tasks();
        self.permissions = new Permissions();
        self.usergroups = new UserGroups();
        self.users = new Users();
    }

    controller.prototype.defaults = {
        pollInterval: 10,
        pollTimeout: 2
    }
    controller.prototype.pluginOrigins = ['base', 'custom'];
    controller.prototype.pluginTypes = ['protocol', 'device', 'task'];
    controller.prototype.systemDevicePluginId = 'df007520-8741-11e3-baa7-0800200c9a66';

    controller.prototype.setup = function (part, callback) {
        var self = this;
        var step = part || 1;


        // admin account
        if (step == 1) {
            new Users().getByLogin('admin', function(users) { 
                if (users.length <= 0) {
                    var UserModel = require('models/user');
                    var user = new UserModel({ name:  'Administrator', login: 'admin', pass: 'admin', enabled: true });
                    user.save(null, { 
                        success: function(result) { self.setup(step + 1, callback);  }, 
                        error: function() { self.setup(step + 1, callback); }
                    });                    
                } else {
                    self.setup(step + 1, callback);
                }
            });
        }

        // admin permissions for full system
        if (step == 2) {
            new Users().getByLogin('admin', function(users) { 
                if (users.length > 0) {
                    var uuidAdmin = users.models[0].id;
                    new Permissions().getBySource('user', uuidAdmin, function(permissions) { 
                        var PermModel = require('models/permission');
                        var permsAdmin = permissions.filterByCode('admin').filterByDestination('system', 'all');
                        var permAdmin = (permsAdmin.length > 0) ? permsAdmin.models[0] : new PermModel({ code: 'admin', srcType: 'user', srcId: uuidAdmin, destType: 'system', destId: 'all', enabled: true });
                        if (!permAdmin.get('enabled')) { permAdmin.set('enabled', true); } 
                        if (!permAdmin.id || permAdmin.changed) {
                            permAdmin.save(null, { 
                                success: function(result) { self.setup(step + 1, callback);  }, 
                                error: function() { self.setup(step + 1, callback); }
                            });                            
                        } else {
                            self.setup(step + 1, callback);    
                        }
                    });
                } else {
                    self.setup(step + 1, callback);    
                }
            });
        }

        // finished
        if (step == 3) {
            if (callback) { callback(); }
        }

    }
    controller.prototype.start = function (part, callback) {
        var self = this;
        var step = part || 1;

        // setup
        if (step == 1) {
            self.setup(1, function() {
                self.start(step + 1, callback);
            });
        }

        // permissions / usergroups / users
        if (step == 2) {
            self.permissions.getAll(function(permissions) {
                self.usergroups.getAll(function(usergroups) {
                    self.users.getAll(function(users) {
                        self.start(step + 1, callback);
                    });
                });
            });
        }

        // plugins / protocols
        if (step == 3) {
            self.importPlugins(function(plugins) {
                self.loadPlugins(function(plugins) {
                    self.loadProtocols(function(protocols) {
                        self.start(step + 1, callback);
                    });
                });
            });
        }

        // devices / tasks
        if (step == 4) {
            //self.initSystemDevice(function(device) {
                self.loadDevices(function(devices) {
                    self.loadTasks(function(tasks) {
                        //var sysDevices = self.devices.filterByPluginId(self.systemDevicePluginId);
                        //if (sysDevices.length > 0) {
                        //    //var sysDevice = sysDevices.models[0];
                        //    //self.doMessageBus('device', sysDevice.id, 'load');
                        //    self.timerSystem(true);
                        //}
                        self.start(step + 1, callback);
                    });
                });
            //});
        }

        // initialize system device
        if (step == 5) {
            self.initSystemDevice(function(device) {
                self.timerSystem(true);
                self.start(step + 1, callback);
            });
        }

        // finished
        if (step == 6) {
            if (callback) { callback(true); }
        }

    }

    controller.prototype.onMessageBus = function(type, id, msg, args) {
        var self = this;

        if (!type || !id || !msg) { return; }

        if (type != 'system') {
            //self.log('debug', '[EVENT ] ' + type + ':' + id + ' => ' + msg);
        }

        if (type == 'device') {
            var model = self.devices.get(id);
            if (model) { self.onDevice('event', model, msg, args); }
        } else if (type == 'plugin') {
            var model = self.plugins.get(id);
            if (model) { self.onPlugin('event', model, msg, args); }
        } else if (type == 'protocol') {
            var model = self.protocols.get(id);
            if (model) { self.onProtocol('event', model, msg, args); }
        } else if (type == 'task') {
            var model = self.tasks.get(id);
            if (model) { self.onTask('event', model, msg, args); }
        } else if (type == 'system') {
            self.onSystem('event', null, msg, args);
        }

    }
    controller.prototype.doMessageBus = function(type, id, msg, args) {
        var self = this;
        
       if (!type || !id || !msg) { return; }

       //self.log('debug', '[ACTION] ' + type + ':' + id + ' => ' + msg);

        if (type == 'device') {
            var model = self.devices.get(id);
            if (model) { self.onDevice('action', model, msg, args); }
        } else if (type == 'plugin') {
            var model = self.plugins.get(id);
            if (model) { self.onPlugin('action', model, msg, args); }
        } else if (type == 'protocol') {
            var model = self.protocols.get(id);
            if (model) { self.onProtocol('action', model, msg, args); }
        } else if (type == 'task') {
            var model = self.tasks.get(id);
            if (model) { self.onTask('action', model, msg, args); }
        } else if (type == 'system') {
            self.onSystem('action', null, msg, args);
        }            
        
    }

    controller.prototype.doSocketSend = function(msg, args) {
        var self = this;
        var iface = self.app.get('interface');
        iface.SocketSend(msg, args);
    }

    controller.prototype.checkDeviceWithConfigExists = function(options) {
        var self = this;
        var res = false;
        
        var pluginId = options.pluginId || '';
        var protocolId = options.protocolId || '';
        var settings = options.settings || {};
        var devices = self.devices.filterByPluginId(pluginId).filterByProtocolId(protocolId);
        devices.map(function(device) {
            var sameSettings = device.compareSettings(settings, true);
            if (sameSettings) { res = true; }
        });
        return res;
    }
    controller.prototype.createDevice = function(options, callback) {
        var self = this;

        if (options && options.protocolId && options.pluginId) {
            var plugin = self.plugins.get(options.pluginId);
            var protocol = self.protocols.get(options.protocolId);
            if ((plugin && protocol) || (plugin && options.protocolId == 'core')) {
                var DeviceModel = require('models/device');
                var def = plugin.plugin.definition;
                options.name = options.name || def.name;
                // settings
                var optSettings = options.settings || {};
                var defSettings = {};
                if (def.fields) {
                    _.each(_.keys(def.fields), function(key) {
                        if (def.fields[key].value) { defSettings[key] = def.fields[key].value; }
                    });
                }
                var settings = _.extend(defSettings, optSettings);
                var device = new DeviceModel({ pluginId: options.pluginId, name: options.name, protocolId: options.protocolId, settings: settings });
                //device.set('configHash', self.getEntityConfigHash(device));
                device.save(null, { 
                    success: function(model) {
                        if (model) {
                            if (callback) { callback(model); }
                            //var uuid = model.get('uuid');    
                            //self.loadDevice(uuid, function(result) {
                            //    if (callback) { callback(result); }
                            //});
                        } else {
                            if (callback) { callback(); }
                        }     
                    }, 
                    error: function() {
                        if (callback) { callback(); } 
                    }
                });
                //return device;
            } else {
                if (callback) { callback(); }     
            }
        } else {
            if (callback) { callback(); }     
        }


        //var opt = options;
        //if (opt && opt.code && opt.name && opt.pluginId && opt.protocolId) { 
        //    var plugin = self.plugins.get(opt.pluginId);
        //    var protocol = self.protocols.get(opt.protocolId);
        //    if ((plugin && protocol) || (plugin && opt.protocolId == 'core' && opt.code == 'core')) {
        //        var DeviceModel = require('models/device');
        //        var def = plugin.plugin.definition;
        //        // settings
        //        var optSettings = opt.settings || {};
        //        var defSettings = {};
        //        if (def.fields) {
        //            var fieldIds = _.keys(def.fields);
        //            _.each(fieldIds, function(key) {
        //                if (def.fields[key].value) { defSettings[key] = def.fields[key].value; }
        //            });
        //        }
        //        var settings = _.extend(defSettings, optSettings);
        //        var device = new DeviceModel({ pluginId: opt.pluginId, name: opt.name, protocolId: opt.protocolId, code: opt.code, settings: settings });
        //        if (callback) { callback(device); }
        //        //device.save(null, { 
        //        //    success: function(result) {
        //        //         if (callback) { callback(result); } 
        //        //    }, 
        //        //    error: function() {
        //        //         if (callback) { callback(); } 
        //        //    }
        //        //});
        //    } else {
        //        if (callback) { callback(); } 
        //    }
        //} else {
        //    if (callback) { callback(); } 
        //}

    }
    controller.prototype.createPluginModel = function (uuid, callback) {
        var self = this;

        function copyPluginObject (obj) {
            var result = {};
            obj = obj || {};
            var props = _.keys(obj);
            _.each(props, function(prop) {
                if (_.isFunction(obj[prop])) {
                    var funOld = obj[prop];
                    var funNew = function() { return funOld.apply(this, arguments); };
                    result[prop] = funNew;
                } else if (_.isObject(obj[prop])) {
                    result[prop] = copyPluginObject(obj[prop]);
                } else {
                    result[prop] = obj[prop];
                }
            });
            return result;
        }

        var files = self.getPluginTemplateFiles();
        var file = _.findWhere(files, { uuid: uuid });
        if (file) {
            self.getPluginTemplateFromFile(file.location, function(template) {
                if (template) {
                    
                    var plugin = {};
                    plugin = copyPluginObject(template);

                    // validate the plugin
                    if (self.validatePluginModel(uuid, plugin)) {
                        if (callback) { callback(plugin); }                            
                    } else {
                        if (callback) { callback(); }
                    }    
                } else {
                    if (callback) { callback(); }
                }
            });
        } else {
            if (callback) { callback(); }
        }
    }
    controller.prototype.createProtocol = function(options, callback) {
        var self = this;

        options = options || {};
        if (options.pluginId && options.interface && options.deviceId) { 
            var plugin = self.plugins.get(options.pluginId);
            if (plugin) {
                var ProtocolModel = require('models/protocol');
                var protocol = new ProtocolModel({ name:  plugin.plugin.definition.name, pluginId: options.pluginId, deviceId: options.deviceId, 'interface': options.interface });
                protocol.save(null, { 
                    success: function(result) {
                         if (callback) { callback(result); } 
                    }, 
                    error: function() {
                         if (callback) { callback(); } 
                    }
                });
            } else {
                if (callback) { callback(); } 
            }
        } else {
            if (callback) { callback(); } 
        }

    }
    controller.prototype.createTask = function(options, callback) {
        var self = this;

        options = options || {};
        if (options.pluginId) { 
            var plugin = self.plugins.get(options.pluginId);
            if (plugin) {
                options.name = options.name || plugin.plugin.definition.name;
                var TaskModel = require('models/task');
                var task = new TaskModel({ name:  options.name, pluginId: options.pluginId });
                task.save(null, { 
                    success: function(result) {
                         if (callback) { callback(result); } 
                    }, 
                    error: function() {
                         if (callback) { callback(); } 
                    }
                });
            } else {
                if (callback) { callback(); } 
            }
        } else {
            if (callback) { callback(); } 
        }

    }
    controller.prototype.getEntity = function(type, id) {
        var self = this;
        var entity;

        if (type == 'device') {
            entity = self.devices.get(id);
        } else if (type == 'plugin') {
            entity = self.plugins.get(id);
        } else if (type == 'protocol') {
            entity = self.protocols.get(id);
        } else if (type == 'task') {
            entity = self.tasks.get(id);
        }     
        return entity;

    }
    controller.prototype.getPluginTemplateFiles = function () {
        // return: array of { uuid, origin, type, location }
        var results = [];
        var self = this;
        var regExUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        
        var fs = require('fs');
        var path = './plugins/';
        var files = fs.readdirSync(path);
        _.each(files, function(file) {
            var location = path + file;
            var arrFile = file.split('.');
            var pluginOrigin = '', pluginType = '', pluginUUID = '';
            _.each(arrFile, function(filePart) {
                if (self.pluginOrigins.indexOf(filePart) >= 0) { pluginOrigin = filePart; }
                if (self.pluginTypes.indexOf(filePart) >= 0) { pluginType = filePart; }
                if (regExUUID.test(filePart)) { pluginUUID = filePart; }
            });
            if (pluginOrigin && pluginType && pluginUUID) { 
                var result =  { uuid: pluginUUID, origin: pluginOrigin, type: pluginType, location: location };
                results.push(result);    
            }
        });
        return results;
    }
    controller.prototype.getPluginTemplateFromFile = function(file, callback) {
        var self = this;

        require([file], 
            function(tpl) {
                try {
                    if (callback) { callback(tpl); } 
                } catch (err) {
                    if (callback) { callback(null); }
                }}, 
            function(err) {
                if (callback) { callback(null); }
            }
        );
    }
    controller.prototype.importPlugins = function(callback) {
        var self = this;
        var results = [];
        var files = self.getPluginTemplateFiles();

        function addPlugin(plugin, callback) {
            var pluginId = plugin.get('uuid');
            new Plugins().getById(pluginId, function(plugins) {
                if (plugins && plugins.length <= 0) {
                    plugin.save(null, { 
                        success: function(result) {
                            var isOk = (result) ? true : false;
                            if (callback) { callback(isOk); }
                        }, 
                        error: function() {
                            if (callback) { callback(false); }
                        }
                    });                       
                } else {
                    if (callback) { callback(true); }
                }
            });
        }

        function recursiveImport(uuids, callback) {
            var uuid = uuids.pop();
            self.createPluginModel(uuid, function(plugin) {
                if (plugin) {
                    // save plugin to store
                    var Plugin = require('models/plugin');
                    var file = _.findWhere(files, { uuid: uuid });
                    var model = new Plugin({ uuid: plugin.definition.uuid, name: plugin.definition.name, type: file.type, origin: file.origin, location: file.location });
                    addPlugin(model, function(result) {
                        if (result) { results.push({ uuid: uuid, model: model}); }
                        if (uuids.length > 0) {
                            recursiveImport(uuids, callback);
                        } else {
                            if (callback) { callback(results); }
                        }
                    });                    
                } else {
                    if (uuids.length > 0) {
                        recursiveImport(uuids, callback);
                    } else {
                        if (callback) { callback(results); }
                    }
                }
            });
        }

        var uuids = _.pluck(files, 'uuid');
        recursiveImport(uuids, callback);
    }
    controller.prototype.initDevice = function(options, callback) {
        var self = this;
        
        var devExists = self.checkDeviceWithConfigExists(options);
        if (devExists) {
            if (callback) { callback(); }
        } else {
            self.createDevice(options, function(device) {
                if (device) {
                    var uuid = device.get('uuid');    
                    self.loadDevice(uuid, function(result) {
                        if (callback) { callback(result); }
                    });
                } else {
                    if (callback) { callback(); }
                }
            });
        }

        //var newDevice = self.createDevice(options);
        //if (newDevice) {
        //    var pluginId = newDevice.get('pluginId');    
        //    var configHash = newDevice.get('configHash');
        //    new Devices().getByPluginId(pluginId, function(devices) {
        //        var similarDevices = devices.filterByConfigHash(configHash);
        //        if (similarDevices.length > 0) {
        //            var uuid = similarDevices.models[0].get('uuid');
        //            self.loadDevice(uuid, function(result) {
        //                if (callback) { callback(result); }
        //            });     
        //        } else {
        //            newDevice.save(null, { 
        //                success: function(model) {
        //                    if (model) {
        //                        var uuid = model.get('uuid');    
        //                        self.loadDevice(uuid, function(result) {
        //                            if (callback) { callback(result); }
        //                        });
        //                    } else {
        //                        if (callback) { callback(); }
        //                    }     
        //                }, 
        //                error: function() {
        //                    if (callback) { callback(); } 
        //                }
        //            });
        //        }
        //    });
        //}
        
    }
    controller.prototype.initProtocol = function(options, callback) {
        var self = this;
        var opt = options;
        if (opt && opt.name && opt.code && opt.interface && opt.deviceId) {
            var plugins = self.plugins.filterByType('protocol').filterByCode(opt.code);
            if (plugins.length > 0) {
                var plugin = plugins.models[0];
                var pluginId = plugin.get('uuid');
                new Protocols().getByDeviceId(opt.deviceId, function(protocols) {
                    var pr = protocols.filterByPluginId(pluginId).filterByInterface(opt.interface);
                    if (pr.length > 0) {
                        var uuid = pr.models[0].get('uuid');
                        self.loadProtocol(uuid, function(result) {
                            if (callback) { callback(result); }
                        });                            
                    } else {
                        var options = { pluginId: pluginId, deviceId: opt.deviceId, 'interface': opt.interface };
                        self.createProtocol(options, function(model) {
                            if (model) {
                                var uuid = model.get('uuid');    
                                self.loadProtocol(uuid, function(result) {
                                    if (callback) { callback(result); }
                                });
                            } else {
                                if (callback) { callback(); }
                            }
                        });                          
                    }
                });
            } else {
                if (callback) { callback(); }
            }
        } else {
            if (callback) { callback(); }
        }
    }
    controller.prototype.initSystemDevice = function(callback) {
        var self = this;
        var options = { code: 'core', name: 'System', protocolId: 'core', pluginId: self.systemDevicePluginId }
        self.initDevice(options, callback);
    }
    controller.prototype.initTask = function(options, callback) {
        var self = this;
        var opt = options;
        if (opt && opt.name && opt.pluginId) {
            var plugin = self.plugins.get(opt.pluginId);
            var options = { pluginId: opt.pluginId, name: opt.name };
            self.createTask(options, function(model) {
                if (model) {
                    var uuid = model.get('uuid');    
                    self.loadTask(uuid, function(result) {
                        if (callback) { callback(result); }
                    });
                } else {
                    if (callback) { callback(); }
                }
            });                          
        } else {
            if (callback) { callback(); }
        }
    }
    controller.prototype.isEventScope = function(event, scope) {
        var aEvent = event.split(':');
        var aScope = scope.split(':');
        if (aScope.length > aEvent.length) { return false; }
        for (var i = 0; i < aScope.length; i++) { 
            if (aScope[i] != aEvent[i])  { return false; }
        }
        return true;
    }
    controller.prototype.isVersion = function (value) {
        var intRegex = /^\d+$/;

        try {
            var arrVersion = value.split('.');
            if (arrVersion.length < 3) { arrVersion.push('0'); }
            if (arrVersion.length < 3) { arrVersion.push('0'); }
            if (arrVersion.length < 3) { arrVersion.push('0'); }
            if(!intRegex.test(arrVersion[0])) { return false; }
            if(!intRegex.test(arrVersion[1])) { return false; }
            if(!intRegex.test(arrVersion[2])) { return false; }
        } catch(err) {
            return false;
        }
        return true;
    }
    controller.prototype.loadDevice = function(uuid, callback) {
        var self = this;

        new Devices().getById(uuid, function(devices) {
            var device = (devices && devices.length > 0) ? devices.models[0] : null;
            if (device) {
                var pluginId = device.get('pluginId');
                self.createPluginModel(pluginId, function(model) {  
                    if (model) {
                        var instance = device; instance.plugin = model;
                        self.preparePluginModelInstance(instance, 'device');
                        self.devices.add(instance, { merge: true });
                        //self.doMessageBus('device', instance.id, 'load');
                        if (callback) { callback(instance); }
                    } else {
                        if (callback) { callback(); }
                    }    
                });
            } else {
                if (callback) { callback(); }
            }
        });
    }
    controller.prototype.loadDevices = function(callback) {
        var self = this;
        var results = [];

        function recursiveLoad(uuids, callback) {
            var uuid = uuids.pop();
            self.loadDevice(uuid, function(result) {
                if (result) { results.push({ uuid: uuid, result: result }); }
                if (uuids.length > 0) {
                    recursiveLoad(uuids, callback);
                } else {
                    if (callback) { callback(results); }
                }
            });
        }

        new Devices().getAll(function(devices) {
            if (devices && devices.length > 0) {
                var deviceIds = devices.pluck('uuid');
                recursiveLoad(deviceIds, callback);
            } else {
                if (callback) { callback(results); }
            }
        });

    }
    controller.prototype.loadPlugin = function(uuid, callback) {
        var self = this;

        self.createPluginModel(uuid, function(model) {  
            if (model) {
                new Plugins().getById(uuid, function(plugins) {
                    var plugin = (plugins && plugins.length > 0) ? plugins.models[0] : null;
                    if (plugin) {
                        //var instance = _.defaults(plugin, model);
                        var instance = plugin; instance.plugin = model;
                        self.preparePluginModelInstance(instance, 'plugin');
                        self.plugins.add(instance, { merge: true });
                        self.doMessageBus('plugin', instance.id, 'load');
                        if (callback) { callback(instance); }
                    } else {
                        if (callback) { callback(); }
                    }
                });
            } else {
                if (callback) { callback(); }
            }    
        });
    }
    controller.prototype.loadPlugins = function(callback) {
        var self = this;
        var results = [];

        function recursiveLoad(uuids, callback) {
            var uuid = uuids.pop();
            self.loadPlugin(uuid, function(result) {
                if (result) { results.push({ uuid: uuid, result: result }); }
                if (uuids.length > 0) {
                    recursiveLoad(uuids, callback);
                } else {
                    if (callback) { callback(results); }
                }
            });
        }

        new Plugins().getAll(function(plugins) {
            if (plugins && plugins.length > 0) {
                var pluginIds = plugins.pluck('uuid');
                recursiveLoad(pluginIds, callback);
            } else {
                if (callback) { callback(results); }
            }
        }, function(err) {
            if (callback) { callback(results); }
        });
    }
    controller.prototype.loadProtocol = function(uuid, callback) {
        var self = this;

        new Protocols().getById(uuid, function(protocols) {
            var protocol = (protocols && protocols.length > 0) ? protocols.models[0] : null;
            if (protocol) {
                var pluginId = protocol.get('pluginId');
                self.createPluginModel(pluginId, function(model) {  
                    if (model) {
                        //var instance = _.defaults(protocol, model);
                        var instance = protocol; instance.plugin = model;
                        self.preparePluginModelInstance(instance, 'protocol');
                        self.protocols.add(instance, { merge: true });
                        self.doMessageBus('protocol', instance.id, 'load');
                        if (callback) { callback(instance); }
                    } else {
                        if (callback) { callback(); }
                    }    
                });
            } else {
                if (callback) { callback(); }
            }
        });
    }
    controller.prototype.loadProtocols = function(callback) {
        var self = this;
        var results = [];

        function recursiveLoad(uuids, callback) {
            var uuid = uuids.pop();
            self.loadProtocol(uuid, function(result) {
                if (result) { results.push({ uuid: uuid, result: result }); }
                if (uuids.length > 0) {
                    recursiveLoad(uuids, callback);
                } else {
                    if (callback) { callback(results); }
                }
            });
        }

        new Protocols().getAll(function(protocols) {
            if (protocols && protocols.length > 0) {
                var protocolIds = protocols.pluck('uuid');
                recursiveLoad(protocolIds, callback);
            } else {
                if (callback) { callback(results); }
            }
        }, function(err) {
            if (callback) { callback(results); }
        });
    }
    controller.prototype.loadTask = function(uuid, callback) {
        var self = this;

        new Tasks().getById(uuid, function(tasks) {
            var task = (tasks && tasks.length > 0) ? tasks.models[0] : null;
            if (task) {
                var pluginId = task.get('pluginId');
                self.createPluginModel(pluginId, function(model) {  
                    if (model) {
                        //var instance = _.defaults(task, model);
                        var instance = task; instance.plugin = model;
                        self.preparePluginModelInstance(instance, 'task');
                        self.tasks.add(instance, { merge: true });
                        self.doMessageBus('task', instance.id, 'load');
                        if (callback) { callback(instance); }
                    } else {
                        if (callback) { callback(); }
                    }    
                });
            } else {
                if (callback) { callback(); }
            }
        });
    }
    controller.prototype.loadTasks = function(callback) {
        var self = this;
        var results = [];

        function recursiveLoad(uuids, callback) {
            var uuid = uuids.pop();
            self.loadTask(uuid, function(result) {
                if (result) { results.push({ uuid: uuid, result: result }); }
                if (uuids.length > 0) {
                    recursiveLoad(uuids, callback);
                } else {
                    if (callback) { callback(results); }
                }
            });
        }

        new Tasks().getAll(function(tasks) {
            if (tasks && tasks.length > 0) {
                var taskIds = tasks.pluck('uuid');
                recursiveLoad(taskIds, callback);
            } else {
                if (callback) { callback(results); }
            }
        }, function(err) {
            if (callback) { callback(results); }
        });
    }
    controller.prototype.log = function() {
        var self = this;
        var logger = self.app.get('logger');
        var args = Array.prototype.slice.call(arguments);
        logger.log.apply(logger, args);
    }
    controller.prototype.pollDevice = function(uuid, force) {
        var self = this;
        var device = self.getEntity('device', uuid);
        if (device) {
            var moment = require('moment');
            var pollInterval = self.defaults.pollInterval;
            var pollTimeStamp = device.status('pollTimestamp') || 0;
            var activeTimeStamp = device.status('activeTimestamp') || 0;
            var currTimeStamp = parseInt(moment.utc().valueOf() / 1000);
            var diff = currTimeStamp - pollTimeStamp;
            if (device.status('polling') && diff > self.defaults.pollTimeout) {
                device.status('polling', false);
                device.status('active', false);
            } else if (device.status('loaded') && !device.status('polling') && (diff > pollInterval || force)) {
                var argsLoad = {}; 
                argsLoad.callback = function(result) { 
                    device.status('active', (result)); 
                    if (result) { device.status('activeTimestamp', currTimeStamp); }
                    device.status('polling', false);
                }
                device.status('polling', true);
                device.status('pollTimestamp', currTimeStamp);
                if (device.plugin.commands.poll) { 
                    device.plugin.commands.poll(argsLoad); 
                }
            } else if (!device.status('loaded')) { 
                self.doMessageBus('device', uuid, 'load');           
            }
        }
    }
    controller.prototype.preparePluginModelInstance = function(instance, type) {
        var self = this;

        function setScope(obj, scope) {
            scope = scope || obj;
            var props = _.keys(obj);
            _.each(props, function(prop) {
                if (_.isFunction(obj[prop])) {
                    var funOld = obj[prop];
                    var funNew = _.bind(funOld, scope);
                    obj[prop] = funNew;
                } else if (_.isObject(obj[prop])) {
                    setScope(obj[prop], scope);
                }
            });
        }

        // generic
        instance.attribute = function(key, value) {
            var mod = instance;
            var valueCurrent = mod.get(key);
            if (value === null || value === undefined) {
                return valueCurrent;
            } else {
                if (value != valueCurrent) {
                    mod.set(key, value);
                    var options = { 'key': key, 'value': value };
                    mod.plugin.trigger('attribute:change', options);
                }
                return value;
            }
        }
        instance.link = function(key, value) {
            var mod = instance;

            var links = mod.get('links') || {};
            var valueCurrent = links[key];
            if (value === null || value === undefined) {
                return valueCurrent;
            } else {
                if (value != valueCurrent) {
                    links[key] = value;
                    mod.set('links', links);
                    var options = { 'key': key, 'value': value };
                    mod.plugin.trigger('link:change', options);
                }
                return value;
            }
        }
        instance.setting = function(key, value) {
            var mod = instance;

            if (instance.id == instance.plugin.definition.uuid) {
                // plugin
                if (instance.plugin.definition.fields) {
                    var field = instance.plugin.definition.fields[key];
                    if (field && field.value) {
                        return field.value;
                    }
                }
            } else {
                // any other instance
                var settings = mod.get('settings') || {};
                var valueCurrent = settings[key];
                if (value === null || value === undefined) {
                    return valueCurrent;
                } else {
                    if (value != valueCurrent) {
                        settings[key] = value;
                        mod.set('settings', settings);
                        var options = { 'key': key, 'value': value };
                        mod.plugin.trigger('setting:change', options);
                    }
                    return value;
                }
            }
        }
        instance.status = function(key, value) {
            var mod = instance;
            if (!mod._status) { mod._status = {}; }
            var valueCurrent = mod._status[key];
            if (value === null || value === undefined) {
                return valueCurrent;
            } else {
                if (value != valueCurrent) {
                    mod._status[key] = value;
                    var options = { 'key': key, 'value': value };
                    mod.plugin.trigger('status:change', options);
                }
                return value;
            }
        }

        // plugin
        var plugin = instance.plugin;
        plugin.instance = plugin.instance || {};
        plugin.instance._uuid = instance.get('uuid');
        plugin.instance._type = type;
        plugin.cache = plugin.cache || {};

        plugin.attribute = function(key) {
            var item = self.getEntity(this.instance._type, this.instance._uuid);
            return (item) ? item.get(key) : null; 
        }
        plugin.command = function(msg, args) { 
            var busMsg = 'command:' + msg;
            self.onMessageBus(this.instance._type, this.instance._uuid, busMsg, args);
        }
        plugin.isInstance = function() {
            var res = (this.instance._type == this.type);
            return res;
        }
        plugin.log = function(msg) {
            self.log('silly', msg);
        }
        plugin.trigger = function(msg, args) { 
            var busMsg = 'trigger:' + msg;
            self.onMessageBus(this.instance._type, this.instance._uuid, busMsg, args);
        }
        plugin.setting = function(key, value) {
            var item = self.getEntity(this.instance._type, this.instance._uuid);
            return (item) ? item.setting(key, value) : null; 
        }
        plugin.status = function(key) {
            var item = self.getEntity(this.instance._type, this.instance._uuid);
            return (item) ? item.status(key) : null; 
        }

        // set scope
        setScope(plugin);

    }
    controller.prototype.timerSystem = function(value) {
        var self = this
        if (value && !self._timerSystem) {
            // start timer    
            self._timerSystem = setInterval(function() {
                self.onMessageBus('system', 'system', 'trigger:timer:tick');
            }, 1000);            
        } else if (!value && self._timerSystem) {
            // stop timer
            clearInterval( self._timerSystem);
        }
    }
    controller.prototype.validatePluginModel = function(uuid, plugin) {
        var self = this;

        try {
            //var plugin = model.prototype;
            // type
            if (!plugin.type) { return false; }
            if (self.pluginTypes.indexOf(plugin.type) < 0) { return false; }
            // definition
            if (plugin.definition.uuid != uuid) { return false; }                
            if (!self.isVersion(plugin.definition.version)) { return false; }
            if (!plugin.definition.name) { return false; }
            // commands
            if (!plugin.commands) { return false; }
            // plugin type specific
            if (plugin.type == 'device') {
                //if (!plugin.definition.manufacturer) { return false; }    
                //
            } 
            if (plugin.type == 'protocol') {
                //
            }
        } catch(err) {
            return false;
        }
        return true;
    }

    controller.prototype.onDevice = function(type, model, msg, args) {
        var self = this;    
        var aMessage = msg.split(':');

        if (type == 'action') { // perform an action on a device
            //  interface:<command>
            if (aMessage.length >= 2 && aMessage[0] == 'interface') {
                var command = aMessage[1];
                var code = args.code;
                var iface = args.interface;
                var opt = args.args;
                if (command && model.plugin.interfaces[code] &&  model.plugin.interfaces[code][command]) { 
                    model.plugin.interfaces[code][command](iface, opt); 
                }
                return;
            }
            //  protocol:<command>
            if (aMessage.length >= 2 && aMessage[0] == 'protocol') {
                var command = aMessage[1];
                if (command && model.plugin.protocol &&  model.plugin.protocol[command]) { 
                    model.plugin.protocol[command](args); 
                }
                return;
            }
            //  command:<function>
            if (aMessage.length >= 2 && aMessage[0] == 'command') {
                var command = aMessage[1];
                if (command && model.plugin.commands[command]) { model.plugin.commands[command](args); }  
                return;
            }
            //  load
            if (msg == 'load') {
                var argsLoad = {};
                argsLoad.callback = function(result) { model.status('loaded', (result)); }
                var loaded = model.status('loaded');
                if (!loaded && model.plugin.commands.load) { model.plugin.commands.load(argsLoad); }
                return;
            }
            //  poll
            if (msg == 'poll') {
                self.pollDevice(model.id);
                return;
            }
            // remove
            if (msg == 'remove') {
                model.destroy();
                self.doSocketSend('api:devices', { id: model.id, type: 'remove' });
                return;
            }
            // <function> (catch all)
            if (aMessage.length > 0) {
                var command = aMessage[0];
                if (command && model.plugin.commands[command]) { model.plugin.commands[command](args); }
                return;
            }
        }
        if (type == 'event') { // event received from a device
            // command:interface:init
            if (msg == 'command:interface:init' && args) {
                var options = { name: args.name, code: args.code, 'interface': args.interface, deviceId: model.get('uuid') };
                self.initProtocol(options, function(protocol) {
                    if (protocol) { self.doMessageBus('protocol', protocol.id, 'load'); }
                });
                return;
            }
            // command:interface:<code>:<command>
            if (aMessage.length >= 4 && aMessage[0] == 'command' && aMessage[1] == 'interface') {
                var iface = aMessage[2];
                var command = aMessage[3];
                var protocols = self.protocols.filterByDeviceId(model.id).filterByInterface(iface);
                if (protocols.length > 0) {
                    var protocolId = protocols.models[0].id;
                    var cba = args;
                    var cbp = _.omit(args, 'callback');
                    cbp.callback = function(result) {
                        if (cba.callback) { cba.callback(result); }
                    }
                    self.doMessageBus('protocol', protocolId, command, cbp);                    
                }
                return;
            }
            // command:protocol:<command>
            if (aMessage.length >= 3 && aMessage[0] == 'command' && aMessage[1] == 'protocol' && args) {
                // forward all these commands to the protocol the device uses
                var command = aMessage[2];
                var protocolId = model.get('protocolId');
                if (protocolId) {
                    var cba = args;
                    var cbp = _.omit(args, 'callback');
                    cbp.callback = function(result) {
                        if (cba.callback) { cba.callback(result); }
                    }
                    self.doMessageBus('protocol', protocolId, command, cbp);                    
                }
                return;
            }
            if (msg == 'trigger:setting:change' && args) {
                //self.log('debug', '[EVENT ] Device "' + model.get('name') + '" setting "' + args.key + '" changed to "' + args.value + '"');
                // if a configuration setting changed, 
                // save any setting change
                model.save();
                // check if this is a trigger we need to respond to
                var triggers = model.plugin.definition.triggers || {};
                var trg = triggers[args.key];
                if (trg) {
                    // find tasks that implement this trigger
                    var tasks = self.tasks.filterByTriggerLinks('device', model.id, args.key);
                    tasks.each(function(task) {
                        task.setting(args.key, args.value);
                    });
                }
                self.doSocketSend('api:devices', { id: model.id, type: 'change' });
                return;
            }
            if (msg == 'trigger:status:change' && args) {
                if (args.key == 'loaded' && args.value == true) {
                    // load sub-devices linked by protocols
                    var protocols = self.protocols.filterByDeviceId(model.id);
                    if (protocols.length > 0) {
                        var pids = protocols.pluck('uuid');
                        var devices = self.devices.filterByProtocolId(pids);
                        devices.each(function(device) {
                            self.doMessageBus('device', device.id, 'load');    
                        });
                    }
                } else if (args.key == 'pollTimestamp') {
                    // do something 
                }
                self.doSocketSend('api:devices', { id: model.id, type: 'change' });
                return;                
            }
        }

    }
    controller.prototype.onPlugin = function(type, model, msg, args) {
        var self = this;    
        var aMessage = msg.split(':');

        if (type == 'action') {
            // command:init
            if (msg == 'command:init' && args) {
                var options = { name: args.name };
                options.pluginId = model.id;
                self.initTask(options, function(task) {
                    if (task) { self.doMessageBus('task', task.id, 'load'); }
                });
                return;
            }
            //  discover
            if (msg == 'discover') {
                var argsDiscover = {};
                argsDiscover.callback = function(result) { 
                    if (result) {
                        var opt = {};
                        opt.protocol = result.protocol;
                        opt.name = result.name || model.plugin.definition.name;
                        opt.settings = result.settings || {};
                        model.plugin.command('device:init', opt);
                    }
                }
                if (model.plugin.commands.discover) { model.plugin.commands.discover(argsDiscover); }
                return;
            }
            //  load
            if (msg == 'load') {
                var argsLoad = {};
                argsLoad.callback = function(result) { model.status('loaded', (result)); }
                var loaded = model.status('loaded');
                if (!loaded && model.plugin.commands.load) { model.plugin.commands.load(argsLoad); }
                return;
            }
            //  protocol:<command>
            if (aMessage.length >= 2 && aMessage[0] == 'protocol') {
                var command = aMessage[1];
                if (command && model.plugin.protocol &&  model.plugin.protocol[command]) { 
                    model.plugin.protocol[command](args); 
                }
                return;
            }
            // perform an action on a plugin
            if (aMessage.length > 0) {
                var command = aMessage[0];
                if (command && model.plugin.commands[command]) { model.plugin.commands[command](args); }
                return;
            }
        }
        if (type == 'event') {
            // event received from a plugin
            if (msg == 'command:device:init' && args) {
                var options = { name: args.name, protocolId: args.protocol, pluginId: model.get('uuid'), settings: args.settings };
                self.initDevice(options, function(device) {
                    if (device) { self.doMessageBus('device', device.id, 'load'); }
                });
                return;
            }     
            if (aMessage.length >= 3 && aMessage[0] == 'command' && aMessage[1] == 'protocol') {
                // forward all protocol commands to all active protocols if none specifically specified
                var command = aMessage[2];
                var pCode = model.plugin.definition.protocol;
                var plugins = self.plugins.filterByType('protocol').filterByCode(pCode);
                var pluginIds = plugins.pluck('uuid');
                var protocols;
                if (args && args.protocol) {
                    protocols = self.protocols.filterById(args.protocol);
                } else {
                    protocols = self.protocols.filterByPluginId(pluginIds);
                }
                protocols.each(function(protocol) {
                    var cba = args;
                    var cbp = _.omit(args, 'callback');
                    var protocolId = protocol.get('uuid');
                    cbp.callback = function(result) {
                        if (cba.callback) { cba.callback(result, protocolId); }
                    }
                    self.doMessageBus('protocol', protocol.id, command, cbp);
                });
                return;
            }

            if (msg == '???') {
                //
                return;
            }            
        }
    }
    controller.prototype.onProtocol = function(type, model, msg, args) {
        var self = this;    
        var aMessage = msg.split(':');

        if (type == 'action') {
            //  load
            if (msg == 'load') {
                var argsLoad = {};
                argsLoad.callback = function(result) { model.status('loaded', (result)); }
                var loaded = model.status('loaded');
                if (!loaded && model.plugin.commands.load) { model.plugin.commands.load(argsLoad); }
                return;
            }
            // <function> (catch all)
            if (aMessage.length > 0) {
                var command = aMessage[0];
                if (command && model.plugin.commands[command]) { model.plugin.commands[command](args); }
                return;
            }
        }
        if (type == 'event') { // event received from a protocol
            // command:client:<command>
            if (aMessage.length >= 3 && aMessage[0] == 'command' && aMessage[1] == 'client') {
                var command = aMessage[2];
                // send to clients of protocol
                self.devices.filterByProtocolId(model.id).each(function(device) {
                    self.doMessageBus('device', device.id, 'protocol:' + command, args);
                });
                // send to plugins that implement this protocol type
                self.plugins.filterByType('device').filterByProtocol(model.plugin.code).each(function(plugin) {
                    self.doMessageBus('plugin', plugin.id, 'protocol:' + command, args);
                });

                return;
            }
            // command:server:<command>
            if (aMessage.length >= 3 && aMessage[0] == 'command' && aMessage[1] == 'server') {
                var command = aMessage[2];
                serverDeviceId = model.get('deviceId');
                var options = { 'code': model.plugin.code, 'interface': model.get('interface'), args: args };
                self.doMessageBus('device', serverDeviceId, 'interface:' + command, options);
                return;
            }
            // trigger:status:change (loaded: true)
            if (msg == 'trigger:status:change' && args && args.key == 'loaded' && args.value ) {
                var devices = self.devices.filterByProtocolId(model.id);
                devices.each(function(device) {
                    self.doMessageBus('device', device.id, 'load');
                });
                return;
            }
        }
    }
    controller.prototype.onTask = function(type, model, msg, args) {
        var self = this;    
        var aMessage = msg.split(':');

        if (type == 'action') {
            //  command:execute
            if (msg == 'command:execute') {
                // execute the task
                var argsExecute = {};
                argsExecute.callback = function(result) { 
                    // call output command
                    var cmd = model.get('command') || {};
                    if (cmd && cmd.type && cmd.uuid && cmd.name) {
                        self.doMessageBus(cmd.type, cmd.uuid, 'command:' + cmd.name, cmd.params);
                    }
                }
                if (model.plugin.commands.execute) { model.plugin.commands.execute(argsExecute); }
                return;
            }
            //  load
            if (msg == 'load') {
                var loaded = model.status('loaded');
                if (!loaded) { model.status('loaded', true); }
                return;
            }
            // remove
            if (msg == 'remove') {
                model.destroy();
                self.doSocketSend('api:tasks', { id: model.id, type: 'remove' });
                return;
            }
            // <function> (catch all)
            //if (aMessage.length > 0) {
            //    var command = aMessage[0];
            //    if (command && model.plugin.commands[command]) { model.plugin.commands[command](args); }
            //    return;
            //}
        }
        if (type == 'event') { 
            if (msg == 'trigger:attribute:change' && args) {
                // save any attribute change
                model.save();
                self.doSocketSend('api:tasks', { id: model.id, type: 'change' });
                return;
            }
            if (msg == 'trigger:link:change' && args) {
                // save any link change
                model.save();
                // get value for the link (remote setting)
                var item = self.getEntity(args.value.type, args.value.uuid);
                if (item) { 
                    var value = item.setting(args.value.trigger);
                    model.setting(args.key, value);
                }
                // notify about the change
                self.doSocketSend('api:tasks', { id: model.id, type: 'change' });
                return;
            }
            if (msg == 'trigger:setting:change' && args) {
                //self.log('debug', '[EVENT ] Task "' + model.get('name') + '" setting "' + args.key + '" changed to "' + args.value + '"');
                // save any setting change
                model.save();
                // check if this is a trigger we need to respond to
                var triggers = model.plugin.definition.triggers || {};
                var trg = triggers[args.key];
                if (trg) {
                    // find other tasks that implement this trigger
                    var tasks = self.tasks.filterByTriggerLinks('task', model.id, args.key);
                    tasks.each(function(task) {
                        if (task.id != model.id) { 
                            task.setting(args.key, args.value);
                        }
                    });
                }
                // check if we need to execute this task
                var fields = model.plugin.definition.fields || {};
                var field = fields[args.key];
                if (field && (field.trigger || field.editable)) {
                    self.doMessageBus('task', model.id, 'command:execute');
                }
                // notify about the change
                self.doSocketSend('api:tasks', { id: model.id, type: 'change' });
                return;
            }
            if (msg == 'trigger:status:change' && args) {
                if (args.key == 'loaded' && args.value == true) {
                    self.doSocketSend('api:tasks', { id: model.id, type: 'add' });
                } else if (args.key == 'pollTimestamp') {
                    // do something 
                }
                return;                
            }
        }
    }
    controller.prototype.onSystem = function(type, model, msg, args) {
        var self = this;    
        var aMessage = msg.split(':');

        if (type == 'action') {
            // perform an action on the system
            if (msg == 'discover:devices') {
                var pluginIds = self.plugins.filterByType('device').pluck('uuid');
                _.each(pluginIds, function(pluginId) {
                    self.doMessageBus('plugin', pluginId, 'discover');
                });
                return;
            }
            if (msg == 'poll:devices') {
                self.devices.each(function(device) {
                    self.pollDevice(device.id);
                });
                return;
            }
            if (aMessage[0] == 'command' && aMessage.length > 1) {
                var command = aMessage[1];
                if (command && model.plugin.commands[command]) { model.plugin.commands[command](args); }
                return;
            }
        }
        if (type == 'event') {
            // event received from the system
            if (msg == 'trigger:timer:tick') {
                // poll all devices
                self.doMessageBus('system', 'system', 'poll:devices');
                return;
            }            
        }
    }

    var exports = controller;
    return exports;
});
