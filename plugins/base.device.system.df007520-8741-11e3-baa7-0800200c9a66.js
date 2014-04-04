﻿define(function() { return {
    type: 'device',
    definition: {
        uuid: 'df007520-8741-11e3-baa7-0800200c9a66',
        version: '0.0.1',
        name: 'System',
        icon: 'server',
        manufacturer: 'HabiThings',
        allowMultiple: false,
        protocol: 'core'
    },
    commands: {
        load: function(args) {
            // internal system devices interface
            var optProtocol = { 'code': 'system', 'interface': this.attribute('uuid'), 'name': 'System' };
            this.command('interface:init', optProtocol);
            args.callback(true);
        },
        poll: function(args) {
            var self = this;
            args.callback(true);
        }
    },
    interfaces: {
        system: {
            getCPUs: function(iface, args) {
                var _ = require('underscore');
                var os = require('os');
                var cpus = [];
                _.each(os.cpus(), function(cpu, index){ cpus.push({ id: index, model: cpu.model, speed: cpu.speed }); });
                if (args.callback) { args.callback(cpus); };
            },
            getNetworkInterfaces: function(iface, args) {
                var ip = require('../libs/ip');
                var ipDefault = ip.address();
                var result = [];
                var interfaces = require('os').networkInterfaces();
                for (var ifName in interfaces) {
                    var addresses = interfaces[ifName];
                    for (var i = 0; i < addresses.length; i++) {
                        var addr = addresses[i];
                        if (addr.family === 'IPv4' && addr.address !== '127.0.0.1' && !addr.internal) {
                            var def = (ipDefault == addr.address);
                            result.push({ name: ifName, address: addr.address, 'default': def });
                            break;
                        }
                    }
                }
                if (args.callback) { args.callback(result); };
            }                            
        }
    }

}});