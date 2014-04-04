define(function() { return {
    type: 'task', * INVALID PLUGIN - DO NOT LOAD ;) *
    definition: {
        uuid: 'df007527-8741-11e3-baa7-0800200c9a66',
        version: '0.0.1',
        name: 'Compare',
        icon: 'task', 
        fields: {
            value1: { label: 'Value 1', description: 'The 1st value to compare.', type: 'number', trigger: true },
            value2: { label: 'Value 2', description: 'The 2nd value to compare.', type: 'number', editable: true },
            result: { label: 'Output', description: 'The result of the comparison.', type: 'bit' }
        },
        triggers: {
            result: { label: 'Compare result', description: 'Fires whenever the result value changes.' }
        }
    },
    commands: {
        execute: function(args) {
            var self = this;
            var v1 = self.setting('value1');
            var v2 = self.setting('value2');
            var res = (v1 < v2);
            self.setting('result', res);
            if (args.callback) { args.callback(true); }
        }
    }
}});    