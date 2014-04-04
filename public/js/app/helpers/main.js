define(['jquery', 'underscore'], function($, _) {
    var controller = function(app) {
        var self = this;
        self.app = app;
    };

    controller.prototype.callServer = function (options, callback) {
        var self = this;
        options = options || {};
        var urlBase = 'http://localhost:8080';
        var urlPath = options.path || '';
        var url = urlBase + '/' + urlPath;
        var type = options.type || 'GET';
        var data = options.data || {} ;
        
        var qs1 = _.pairs(data);
        var qs2 = _.map(qs1, function(item) { return item[0] + '=' + item[1] });
        var qs = qs2.join('&');

        $.ajax({ url: url, type: type, data: qs, 
            success: function(data) { 
                if (callback) { callback(data); }
            }, 
            error: function() {  
                if (callback) { callback(); }
            } 
        });  
    }
    controller.prototype.dialog = function(options, callback) {
        var self = this;
        var options = options || {};
        if (options.view) { 
            require(['views/dialog'], function (Dialog) {
                var dialog = new Dialog(options);
                dialog.on('dialog:cancel', function (args) {
                    self.app.dialogRegion.close();
                    if (callback) { callback(false); }
                });
                dialog.on('dialog:ok', function (args) {
                    self.app.dialogRegion.close();
                    if (callback) { callback(true); }
                });
                if (options.viewBinds && options.viewBinds.ok) {
                    _.each(options.viewBinds.cancel, function(trg) {
                        options.view.on(trg, function(args) {
                            dialog.trigger('dialog:cancel', args);
                        });
                    });
                    _.each(options.viewBinds.ok, function(trg) {
                        options.view.on(trg, function(args) {
                            dialog.trigger('dialog:ok', args);
                        });
                    });
                }
                self.app.dialogRegion.show(dialog);                
            });
        } else {
            if (callback) { callback(false); }
        }
    }

    controller.prototype.dialogInput = function(options, callback) {
        var self = this;
        var options = options || {};

        require(['views/input'], function (Input) {
            var input = new Input(options);
            var viewBinds = { ok: ['input:change'] };
            var actionOk = _.contains(['text'], options.type)
            var actionCancel = _.contains(['list', 'trigger'], options.type)
            var optDialog = { view: input, viewBinds: viewBinds, actions: { ok: { visible: actionOk }, cancel: { visible: actionCancel } } };
            if (options.label) { optDialog.title = options.label; }
            self.app.main.dialog(optDialog, function(result) {
                if (result) {
                    var val = input.value;
                    if (callback) { callback(true, val); }    
                } else {
                    if (callback) { callback(false); }
                }
            });
        });
    }
    controller.prototype.getEntity = function(type, id) {
        var self = this;
        var entity;
        if (type == 'device') {
            entity = self.app.store.get('devices').get(id);
        } else if (type == 'plugin') {
            entity = self.app.store.get('plugins').get(id);
        } else if (type == 'protocol') {
            entity = self.app.store.get('protocols').get(id);
        } else if (type == 'task') {
            entity = self.app.store.get('tasks').get(id);
        }     
        return entity;
    }
    controller.prototype.isAuthenticated = function (callback) {
        var self = this;

        var options = { path: 'auth/check'};
        self.callServer(options, function(result) {
            if (result == 'OK') {
                if (callback) { callback(true); }
            } else {
                if (callback) { callback(false); }
            }
        });
    }

    controller.prototype.onResize = function () {
        var self = this;

        var clsRemove = 'size-xs size-sm size-md size-lg size-hxs size-hsm size-hmd size-hlg';
        clsRemove += ' size-curr-xs size-curr-sm size-curr-md size-curr-lg size-curr-hxs size-curr-hsm size-curr-hmd size-curr-hlg';
        var clsAdd = '';

        clsAdd += 'size-xs';
        clsAdd += (window.innerWidth >= 768) ? ' size-sm' : '';
        clsAdd += (window.innerWidth >= 992) ? ' size-md' : '';
        clsAdd += (window.innerWidth >= 1200) ? ' size-lg' : '';

        clsAdd += (window.innerWidth < 768) ? ' size-curr-xs' : '';
        clsAdd += (window.innerWidth >= 768 && window.innerWidth < 992) ? ' size-curr-sm' : '';
        clsAdd += (window.innerWidth >= 992 && window.innerWidth < 1200) ? ' size-curr-md' : '';
        clsAdd += (window.innerWidth >= 1200) ? ' size-curr-lg' : '';

        clsAdd += ' size-hxs';
        clsAdd += (window.innerHeight >= 480) ? ' size-hsm' : '';
        clsAdd += (window.innerHeight >= 640) ? ' size-hmd' : '';
        clsAdd += (window.innerHeight >= 768) ? ' size-hlg' : '';

        clsAdd += (window.innerHeight < 480) ? ' size-curr-hxs' : '';
        clsAdd += (window.innerHeight >= 480 && window.innerHeight < 640) ? ' size-curr-hsm' : '';
        clsAdd += (window.innerHeight >= 640 && window.innerHeight < 768) ? ' size-curr-hmd' : '';
        clsAdd += (window.innerHeight >= 768) ? ' size-curr-hlg' : '';

        $('body').removeClass(clsRemove).addClass(clsAdd);
    }

    var exports = controller;
    return exports;
});
