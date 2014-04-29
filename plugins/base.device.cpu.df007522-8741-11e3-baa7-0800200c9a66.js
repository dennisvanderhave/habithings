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
            id: { label: 'Identifier', description: 'The unique identifier for the processor.', type: 'string', config: true },
            model: { label: 'Model', description: 'The processor model.', type: 'string' },
            speed: { label: 'Speed', description: 'The processor speed.', type: 'string' },
            cores: { label: 'Cores', description: 'The number of processor cores.', type: 'number' }
        }
    },
    commands: {
        discover: function(args) {
            var self = this;
            this.command('protocol:getCPUs', { callback: function(result, protocol) {
                //var _ = require('underscore');
                //_.each(result, function(cpu) {
                //    var optDevice = { 'name': 'CPU ' + cpu.id, protocol: protocol, settings: { cpu: 'cpu' } };
                //     args.callback(optDevice);
                //});
                if (result && result.length > 0) {
                    var settings = {};
                    settings.id = 'cpu0';
                    settings.model = result[0].model || 'Unknown model';
                    settings.speed = result[0].speed || 'Unknown speed';
                    settings.cores = result.length || 1;
                    var optDevice = { 'name': 'CPU', protocol: protocol, settings: settings };
                    args.callback(optDevice);  
                }
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