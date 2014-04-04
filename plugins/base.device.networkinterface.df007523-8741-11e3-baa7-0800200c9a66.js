define(function() { return {
    type: 'device',
    definition: {
        uuid: 'df007523-8741-11e3-baa7-0800200c9a66',
        version: '0.0.1',
        name: 'Network Interface',
        icon: 'network',
        manufacturer: 'HabiThings',
        protocol: 'system',
        fields: {
            iface: { label: 'Network interface identifier', description: 'The unique identifier for the network interface.', type: 'string', config: true },
            is_default: { label: 'Default connection', description: 'Identifies if this is the default interface.', type: 'bit', config: true }
        }
    },
    commands: {
        discover: function(args) {
            // find an interface on another device that we can use to talk to THIS hardware
            //   protocol triggers from here (plugin scope), will be send to all protocols of the type we can talk to
            //   multiple parent devices, which interface that protocol, can respond to a callback-function in a specified argument
            //   when initiating an instance of the device this plugin represents, make sure that the combination of protocolId + code = unique
            var self = this;
            var _ = require('underscore');
            self.command('protocol:getNetworkInterfaces', { callback: function(result, protocol) {
                _.each(result, function(iface) {
                    var optDevice = { 'name': iface.name, protocol: protocol, settings: { iface: iface.name, is_default: iface.default } };
                    args.callback(optDevice);
                });
            }});
        },
        load: function(args) {
            var self = this;
            var _ = require('underscore');
            // initialize
            self.command('protocol:getNetworkInterfaces', { callback: function(result) {
                //_.each(result, function(iface) {
                //    if (self.attribute('code') == iface.name) { self._isInternet = iface.default; }
                //});
                // http clients interface
                var optProtocol = { 'code': 'http', 'interface': 'http', 'name': 'Http' };
                self.command('interface:init', optProtocol);
                // return result
                if (args.callback) { args.callback(true); }
            }});
        },
        poll: function(args) {
            var self = this;
            args.callback(true);
        }
    },
    interfaces: {
        http: {
            getUrl: function(iface, args) {
                var self = this;
                var isInternet = self.setting('is_default');
                if (isInternet && args && args.url && args.callback) {
                    var urlInfo = require('url').parse(args.url);
                    //
                    require('http').get(args.url, function(res) {
                        res.on('data', function(chunk) {
                            var content = chunk.toString();
                            var result = { status: res.statusCode, content: content };
                            args.callback(result);
                        });
                    }).on('error', function(e) {
                        args.callback();
                    });
                }
            }
        }
    }
    
}});
