define(function() { return {
    type: 'task',
    definition: {
        uuid: 'df007526-8741-11e3-baa7-0800200c9a66',
        version: '0.0.1',
        name: 'Compare numbers',
        icon: 'task',
        fields: {
            trigger1: { label: 'First trigger', description: 'The first trigger to use in the compare.', type: 'number', trigger: true },
            trigger2: { label: 'Second trigger', description: 'The second trigger to use in the compare.', type: 'number', trigger: true },
            value1: { label: 'Fixed value', description: 'Fixed value to use in the compare.', type: 'number', editable: true },
            compare_type: { label: 'Compare type', description: 'The way to compare the triggers.', type: 'string', editable: true, select: 'getCompareTypes' },
            result: { label: 'Output', description: 'The result of the comparison.', type: 'bit' }
        },
        triggers: {
            result: { label: 'Compare result', description: 'Fires whenever the result value changes.' }
        }
    },
    commands: {
        execute: function(args) {
            var self = this;
            var _ = require('underscore');
            var t1 = (_.isNumber(self.setting('trigger1')) == true) ? self.setting('trigger1') : 0;
            var t2 = (_.isNumber(self.setting('trigger2')) == true) ? self.setting('trigger2') : 0;
            var v1 = (_.isNumber(self.setting('value1')) == true) ? self.setting('value1') : 0;
            var cpr = self.setting('compare_type') || '';
            var res = false;

            if (cpr) {
                if (cpr == 't1eqt2' && t1 == t2) { res = true; }
                if (cpr == 't1eqv1' && t1 == v1) { res = true; }
                if (cpr == 't1nqt2' && t1 != t2) { res = true; }
                if (cpr == 't1nqv1' && t1 != v1) { res = true; }
                if (cpr == 't1gtt2' && t1 > t2) { res = true; }
                if (cpr == 't1gtv1' && t1 > v1) { res = true; }
                if (cpr == 't1ltt2' && t1 < t2) { res = true; }
                if (cpr == 't1ltv1' && t1 < v1) { res = true; }
                if (cpr == 't1get2' && t1 >= t2) { res = true; }
                if (cpr == 't1gev1' && t1 >= v1) { res = true; }
                if (cpr == 't1let2' && t1 <= t2) { res = true; }
                if (cpr == 't1lev1' && t1 <= v1) { res = true; }
            }
            self.setting('result', res);
            if (args.callback) { args.callback(true); }
        }
    },
    functions: {
        getCompareTypes: function() {
            var result = [];
            result.push({ id: 't1eqt2', label: 'First trigger and second trigger are equal.' });
            result.push({ id: 't1eqv1', label: 'First trigger and fixed value are equal.' });
            result.push({ id: 't1nqt2', label: 'First trigger and second trigger are NOT equal.' });
            result.push({ id: 't1nqv1', label: 'First trigger and fixed value are NOT equal.' });
            result.push({ id: 't1gtt2', label: 'First trigger is greater than second trigger.' });
            result.push({ id: 't1gtv1', label: 'First trigger is greater than fixed value.' });
            result.push({ id: 't1ltt2', label: 'First trigger is less than second trigger.' });
            result.push({ id: 't1ltv1', label: 'First trigger is less than fixed value.' });
            result.push({ id: 't1get2', label: 'First trigger is greater than or equal to second trigger.' });
            result.push({ id: 't1gev1', label: 'First trigger is greater than or equal to fixed value.' });
            result.push({ id: 't1let2', label: 'First trigger is less than or equal to second trigger.' });
            result.push({ id: 't1lev1', label: 'First trigger is less than or equal to fixed value.' });
            return result;
        }
        
    }
}});    