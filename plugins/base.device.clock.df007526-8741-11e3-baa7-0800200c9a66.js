define(function() { return {
    type: 'device',
    definition: {
        uuid: 'df007526-8741-11e3-baa7-0800200c9a66',
        version: '0.0.1',
        name: 'Clock',
        icon: 'clock',
        manufacturer: 'HabiThings',
        protocol: 'system',
        poll: 5,
        fields: {
            id: { label: 'Identifier', description: 'The unique identifier for the clock.', type: 'string', config: true },
            date: { label: 'Date', description: 'The current system date/time.', type: 'date' }
        },
        triggers: {
            date: { label: 'Date / time change', description: 'Fires whenever the date or time changes.' }
        }
    },
    commands: {
        discover: function(args) {
            var self = this;
            this.command('protocol:getDateTime', { callback: function(result, protocol) {
                if (result && result.date) {
                    var settings = {};
                    settings.id = 'clock0';
                    var optDevice = { 'name': 'Clock', protocol: protocol, settings: { id: 'clock0' } };
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
            this.command('protocol:getDateTime', { callback: function(result) {
                if (result) {
                    self.setting('date', result);
                    args.callback(true);  
                } else {
                    args.callback(false);
                }
            } });
        }
    }
    
}});