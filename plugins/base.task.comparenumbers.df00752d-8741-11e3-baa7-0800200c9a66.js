define(function() { return {
    type: 'task',
    definition: {
        uuid: 'df00752d-8741-11e3-baa7-0800200c9a66',
        version: '0.0.1',
        name: 'Compare numbers',
        icon: 'task',
        fields: {
            value1: { label: 'Value 1', description: 'The first value to use in the compare.', type: 'number', trigger: true },
            value2: { label: 'Value 2', description: 'The second value to use in the compare.', type: 'number', trigger: true },
            value3: { label: 'Value 3', description: 'The third value to use in the compare.', type: 'number', editable: true },
            compare_type: { label: 'Compare type', description: 'The way to compare the values.', type: 'string', editable: true, select: 'getCompareTypes' },
            result: { label: 'Result', description: 'The result of the comparison.', type: 'bit' }
        },
        triggers: {
            result: { label: 'Result change', description: 'Fires whenever the result value changes.' }
        }
    },
    commands: {
        execute: function(args) {
            var self = this;
            var _ = require('underscore');
            var v1 = (_.isNumber(self.setting('value1')) == true) ? self.setting('value1') : 0;
            var v2 = (_.isNumber(self.setting('value2')) == true) ? self.setting('value2') : 0;
            var v3 = (_.isNumber(self.setting('value3')) == true) ? self.setting('value3') : 0;
            var cpr = self.setting('compare_type') || '';
            var res = false;

            if (cpr) {
                if (cpr == 'v1eqv2' && v1 == v2) { res = true; }
                if (cpr == 'v1eqv3' && v1 == v3) { res = true; }
                if (cpr == 'v1nqv2' && v1 != v2) { res = true; }
                if (cpr == 'v1nqv3' && v1 != v3) { res = true; }
                if (cpr == 'v1gtv2' && v1 > v2) { res = true; }
                if (cpr == 'v1gtv3' && v1 > v3) { res = true; }
                if (cpr == 'v1ltv2' && v1 < v2) { res = true; }
                if (cpr == 'v1ltv3' && v1 < v3) { res = true; }
                if (cpr == 'v1gev2' && v1 >= v2) { res = true; }
                if (cpr == 'v1gev3' && v1 >= v3) { res = true; }
                if (cpr == 'v1lev2' && v1 <= v2) { res = true; }
                if (cpr == 'v1lev3' && v1 <= v3) { res = true; }
            }
            self.setting('result', res);
            if (args.callback) { args.callback(true); }
        }
    },
    functions: {
        getCompareTypes: function() {
            var result = [];
            result.push({ id: 'v1eqv2', label: 'Value 1 and value 2 are equal.' });
            result.push({ id: 'v1eqv3', label: 'Value 1 and value 3 are equal.' });
            result.push({ id: 'v1nqv2', label: 'Value 1 and value 2 are NOT equal.' });
            result.push({ id: 'v1nqv3', label: 'Value 1 and value 3 are NOT equal.' });
            result.push({ id: 'v1gtv2', label: 'Value 1 is greater than value 2.' });
            result.push({ id: 'v1gtv3', label: 'Value 1 is greater than value 3.' });
            result.push({ id: 'v1ltv2', label: 'Value 1 is less than value 2.' });
            result.push({ id: 'v1ltv3', label: 'Value 1 is less than value 3.' });
            result.push({ id: 'v1gev2', label: 'Value 1 is greater than or equal to value 2.' });
            result.push({ id: 'v1gev3', label: 'Value 1 is greater than or equal to value 3.' });
            result.push({ id: 'v1lev2', label: 'Value 1 is less than or equal to value 2.' });
            result.push({ id: 'v1lev3', label: 'Value 1 is less than or equal to value 3.' });
            return result;
        }
        
    }
}});    