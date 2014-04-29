define(function() { return {
    type: 'device',
    definition: {
        uuid: 'df007527-8741-11e3-baa7-0800200c9a66',
        version: '0.0.1',
        name: 'Memory',
        icon: 'ram',
        manufacturer: 'HabiThings',
        protocol: 'system',
        fields: {
            id: { label: 'Identifier', description: 'The unique identifier for the memory.', type: 'string', config: true },
            total: { label: 'Total', description: 'The total amount of memory in bytes.', type: 'number' },
            free: { label: 'Free', description: 'The amount of free memory in bytes.', type: 'number' },
            used: { label: 'Used', description: 'The amount of memory in use.', type: 'number' },
            used_perc: { label: 'Used percentage', description: 'The percentage of memory in use.', type: 'number' }
        },
        triggers {
            free: { label: 'Free memory change', description: 'Fires whenever the amount of free memory changes.', type: 'number' },
            used: { label: 'Used memory change', description: 'Fires whenever the amount of used memory changes.', type: 'number' },
            used_perc: { label: 'Used memory percentage change', description: 'Fires whenever percentage of used memory the changes.', type: 'number' }
        }
    },
    commands: {
        discover: function(args) {
            var self = this;
            this.command('protocol:getMemory', { callback: function(result, protocol) {
                if (result) {
                    var settings = {};
                    settings.id = 'mem0';
                    settings.total = result.total || 0;
                    settings.free = result.free || 0;
                    settings.used = result.total - settings.free;
                    settings.used_perc = (settings.total > 0) ? Math.round((settings.used / settings.total) * 100) : 0;
                    var optDevice = { 'name': 'Memory', protocol: protocol, settings: settings };
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
            this.command('protocol:getMemory', { callback: function(result) {
                if (result) {
                    self.setting('total', result.total || 0);
                    self.setting('free', result.free || 0);
                    var total = self.setting('total'); var free = self.setting('free');
                    self.setting('used', total - free);
                    var used_perc = (total > 0) ? Math.round(((total - free) / total) * 100) : 0;
                    self.setting('used_perc', used_perc);
                    args.callback(true);  
                } else {
                    args.callback(false);    
                }
            } });
        }
    }
    
}});