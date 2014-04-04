define(function() { return {
    type: 'protocol',
    code: 'http',
    definition: {
        uuid: 'df007524-8741-11e3-baa7-0800200c9a66',
        version: '0.0.1',
        name: 'Http',
    },
    commands: {
        load: function(args) {
            if (args.callback) { args.callback(true); }
        },
        // communication
        // "client:<command>" -- 
        // "server:<command>" -- 
        getUrl: function() {
            this.command('server:getUrl', arguments[0]);
        }
        //getNetworkInterfaces: function() {
        //    this.command('server:getNetworkInterfaces', arguments[0]);
        //}
    }
}});