define(function() { return {
    type: 'protocol',
    code: 'serial',
    definition: {
        uuid: 'df007529-8741-11e3-baa7-0800200c9a66',
        version: '0.0.1',
        name: 'Serial',
    },
    commands: {
        // functions
        load: function(args) {
            if (args.callback) { args.callback(true); }
        },
        close: function() {
            this.command('server:close', arguments[0]);
        },        
        flush: function() {
            this.command('server:flush', arguments[0]);
        },
        open: function() {
            this.command('server:open', arguments[0]);
        },
        write: function() {
            this.command('server:write', arguments[0]);
        },
        // events
        onClose: function() {
            this.command('client:onClose', arguments[0]);
        },
        onData: function() {
            this.command('client:onData', arguments[0]);
        },
        onError: function() {
            this.command('client:onError', arguments[0]);
        },
        onOpen: function() {
            this.command('client:onOpen', arguments[0]);
        }
    }
}});