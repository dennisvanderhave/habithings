define(function() { return {
    type: 'protocol',
    code: 'rfac',
    definition: {
        uuid: 'df00752b-8741-11e3-baa7-0800200c9a66',
        version: '0.0.1',
        name: 'AC RF Learning Mode',
    },
    commands: {
        // functions
        load: function(args) {
            if (args.callback) { args.callback(true); }
        },
        learn: function() {
            this.command('server:learn', arguments[0]);
        },
        off: function() {
            this.command('server:off', arguments[0]);
        },        
        on: function() {
            this.command('server:on', arguments[0]);
        },


        // events
        //onClose: function() {
        //    this.command('client:onClose', arguments[0]);
        //},
        //onData: function() {
        //    this.command('client:onData', arguments[0]);
        //},
        //onError: function() {
        //    this.command('client:onError', arguments[0]);
        //},
        //onOpen: function() {
        //    this.command('client:onOpen', arguments[0]);
        //}
    }
}});