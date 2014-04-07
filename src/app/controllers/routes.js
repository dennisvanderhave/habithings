define([], function() {

    var controller = {};

    // GENERIC
    controller.init = function(app) {
        var self = this;
        self.app = app;

        // AUTH
        app.get('/auth/check', self.authCheck);
        app.post('/auth/login', self.authLogin);
        app.post('/auth/logout', self.authLogout);

        // API - DEVICES
        app.get('/api/devices', self.isAuthorized, self.apiDevices);
        app.get('/api/devices/:id', self.isAuthorized, self.apiDevices);
        app.post('/api/devices', self.isAuthorized, self.apiDevices);
        app.put('/api/devices/:id', self.isAuthorized, self.apiDevices);
        app.delete('/api/devices/:id', self.isAuthorized, self.apiDevices);
        // API - PLUGINS
        app.get('/api/plugins', self.isAuthorized, self.apiPlugins);
        app.get('/api/plugins/:id', self.isAuthorized, self.apiPlugins);
        // API - PROTOCOLS
        app.get('/api/protocols', self.isAuthorized, self.apiProtocols);
        app.get('/api/protocols/:id', self.isAuthorized, self.apiProtocols);
        // API - SYSTEM
        app.get('/api/system/discover/:type', self.isAuthorized, self.apiSystemDiscover);
        // API - TASKS
        app.get('/api/tasks', self.isAuthorized, self.apiTasks);
        app.get('/api/tasks/:id', self.isAuthorized, self.apiTasks);
        app.post('/api/tasks', self.isAuthorized, self.apiTasks);
        app.put('/api/tasks/:id', self.isAuthorized, self.apiTasks);
        app.delete('/api/tasks/:id', self.isAuthorized, self.apiTasks);

        // OTHERS
        app.get('/flash', function(req, res){
            res.send(req.flash('error'));
        });
        app.all('*', self.notFound);  
    }

    // AUTH
    controller.authCheck = function(req, res) {
        if (req.isAuthenticated()) {
            res.send('OK');
        } else {
            res.send('FAILED'); 
        }
    }
    controller.authLogin = function(req, res) {
        var auth = req.app.get('authorization');
        auth.authenticate(req, res, function(user) {
            if (user) {
                req.logIn(user, function(err) {
                    if (!err) { 
                        res.send(200); 
                    } else {
                        res.send(401);
                    }
                });
            } else {
                res.send(401); 
            }
        });
    }
    controller.authLogout = function(req, res) {
        req.logout();
        res.send(200); 
    }

    // API
    controller.apiDevices = function(req, res) {
        var self = require('controllers/routes');
        var iface = self.app.get('interface');

        if (req.method == 'GET' && req.params.id) {
            var device = iface.GetDevice(req.user.id, req.params.id); 
            var output = (device) ? JSON.stringify(device) : 404;
            res.send(output);
        } else if (req.method == 'GET') {
            var devices = iface.GetDevices(req.user.id); 
            var output = (devices) ? JSON.stringify(devices) : 404;
            res.send(output);
        } else if (req.method == 'POST') {
            iface.AddDevice(req.user.id, req.body, function(device) {
                var output = (device) ? JSON.stringify(device) : 404;
                res.send(output);
            });             
        } else if (req.method == 'PUT' && req.params.id) {
            iface.UpdateDevice(req.user.id, req.params.id, req.body, function(device) {
                var output = (device) ? JSON.stringify(device) : 404;
                res.send(output);
            }); 
        } else if (req.method == 'DELETE' && req.params.id) {
            var result = iface.DeleteDevice(req.user.id, req.params.id);
            var output = (result) ? 200 : 401;
            res.send(output);
        }
        //var devices = iface.GetDevices(req.user.id); 
        //if (devices) {
        //    res.send(JSON.stringify(devices));
        //} else {
        //    res.send(404);
        //}
    }
    controller.apiSystemDiscover = function(req, res) {
        var self = require('controllers/routes');
        var iface = self.app.get('interface');

        var result = iface.SystemDiscover(req.user.id, req.params.type);
        if (result) {
            res.send(200);
        } else {
            res.send(401);
        }
    }
    controller.apiProtocols = function(req, res) {
        var self = require('controllers/routes');
        var iface = self.app.get('interface');

        if (req.method == 'GET' && req.params.id) {
            var protocol = iface.GetProtocol(req.user.id, req.params.id); 
            var output = (protocol) ? JSON.stringify(protocol) : 404;
            res.send(output);
        } else if (req.method == 'GET') {
            var protocols = iface.GetProtocols(req.user.id); 
            var output = (protocols) ? JSON.stringify(protocols) : 404;
            res.send(output);
        } else if (req.method == 'POST') {
            //
        } else if (req.method == 'PUT' && req.params.id) {
            //
        } else if (req.method == 'DELETE' && req.params.id) {
            //
        }
    }
    controller.apiPlugins = function(req, res) {
        var self = require('controllers/routes');
        var iface = self.app.get('interface');

        if (req.method == 'GET' && req.params.id) {
            var plugin = iface.GetPlugin(req.user.id, req.params.id); 
            var output = (plugin) ? JSON.stringify(plugin) : 404;
            res.send(output);
        } else if (req.method == 'GET') {
            var plugins = iface.GetPlugins(req.user.id); 
            var output = (plugins) ? JSON.stringify(plugins) : 404;
            res.send(output);
        }

    }
    controller.apiTasks = function(req, res) {
        var self = require('controllers/routes');
        var iface = self.app.get('interface');

        if (req.method == 'GET' && req.params.id) {
            var task = iface.GetTask(req.user.id, req.params.id); 
            var output = (task) ? JSON.stringify(task) : 404;
            res.send(output);
        } else if (req.method == 'GET') {
            var tasks = iface.GetTasks(req.user.id); 
            var output = (tasks) ? JSON.stringify(tasks) : 404;
            res.send(output);
        } else if (req.method == 'POST') {
            iface.AddTask(req.user.id, req.body, function(task) {
                var output = (task) ? JSON.stringify(task) : 404;
                res.send(output);
            });             
        } else if (req.method == 'PUT' && req.params.id) {
            iface.UpdateTask(req.user.id, req.params.id, req.body, function(task) {
                var output = (task) ? JSON.stringify(task) : 404;
                res.send(output);
            }); 
        } else if (req.method == 'DELETE' && req.params.id) {
            var result = iface.DeleteTask(req.user.id, req.params.id);
            var output = (result) ? 200 : 401;
            res.send(output);
        }
    }
    
    // OTHERS
    controller.notFound = function(req, res) {
        res.send(404);
    }
    controller.isAuthorized = function(req, res, next) {

        //res.setHeader('Access-Control-Allow-Origin', '*');
        //// Request methods you wish to allow
        //res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        //// Request headers you wish to allow
        //res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        //// Set to true if you need the website to include cookies in the requests sent
        //// to the API (e.g. in case you use sessions)
        //res.setHeader('Access-Control-Allow-Credentials', true);

        if (req.isAuthenticated()) {
            next();
        } else {
            res.send(401); 
        }
    }

    var exports = controller;
    return exports;
});
