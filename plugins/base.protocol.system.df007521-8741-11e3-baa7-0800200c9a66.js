define(function() { return {
    type: 'protocol',
    code: 'system',
    definition: {
        uuid: 'df007521-8741-11e3-baa7-0800200c9a66',
        version: '0.0.1',
        name: 'System'
    },
    commands: {
        load: function(args) {
            if (args.callback) { args.callback(true); }
        },

        // communication
        // "client:<command>" -- 
        // "server:<command>" -- 
        getCPUs: function() {
            this.command('server:getCPUs', arguments[0]);
        },
        getNetworkInterfaces: function() {
            this.command('server:getNetworkInterfaces', arguments[0]);
        },
        getSerialPorts: function() {
            this.command('server:getSerialPorts', arguments[0]);
        }
    }
}});