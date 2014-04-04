define(function() { return {
    type: 'device',
    definition: {
        uuid: 'df007522-8741-11e3-baa7-0800200c9a66',
        version: '0.0.1',
        name: 'CPU',
        icon: 'cpu',
        manufacturer: 'HabiThings',
        protocol: 'system',
        fields: {
            cpu: { label: 'CPU Identifier', description: 'The unique identifier for the CPU.', type: 'string', config: true }
        }
    },
    commands: {
        discover: function(args) {
            // find an interface on another device that we can use to talk to THIS hardware
            //   protocol triggers from here (plugin scope), will be send to all protocols of the type we can talk to
            //   multiple parent devices, which interface that protocol, can respond to a callback-function in a specified argument
            //   when initiating an instance of the device this plugin represents, make sure that the combination of protocolId + code = unique
            var self = this;
            this.command('protocol:getCPUs', { callback: function(result, protocol) {
                var _ = require('underscore');
                _.each(result, function(cpu) {
                    var optDevice = { 'name': 'CPU ' + cpu.id, protocol: protocol, settings: { cpu: cpu.id } };
                     args.callback(optDevice);
                });
            } });
        },
        load: function(args) {
            var self = this;
            args.callback(true);
        },
        poll: function(args) {
            var self = this;
            args.callback(true);
        }
    }
    
}});