define(function() { return {
    type: 'device',
    definition: {
        uuid: 'df00752c-8741-11e3-baa7-0800200c9a66',
        version: '0.0.1',
        name: 'AC Learning Mode Light / Switch',
        icon: '',
        manufacturer: 'HabiThings',
        protocol: 'rfac',
        fields: {
            state: { label: 'State', description: 'The on/off state of the device.', type: 'bit' },
            unitid: { label: 'Unit identifier', description: 'The unique unit identifier for the device.', type: 'integer' },
            unitcode: { label: 'Unit code', description: 'The unique unit code for the device.', type: 'integer' }
        }
    },
    cache: {
        unitId: null,
        unitCode: null
    },
    commands: {
        discover: function(args) {
            var self = this;
            args.callback(false); // device cannot be discovered
        },
        load: function(args) {
            var self = this;
            if (self.isInstance()) {
                if (!self.setting('unitid')) {
                    self.setting('unitid', Math.floor((Math.random() * 67108863) + 1));     // can be 0x00 00 00 01 to 0x03 FF FF FF 
                }
                if (!self.setting('unitcode')) {
                    self.setting('unitcode', Math.floor((Math.random() * 16) + 1));         // can be 0x01 to 0x10 = unit 1 to 16
                }
                self.cache.unitId = self.functions.numToHexArray(self.setting('unitid'), 4);
                self.cache.unitCode = self.setting('unitcode');
                // restore state
                var state = self.setting('state');
                var cmd = (state) ? 'protocol:on' : 'protocol:off';
                self.command(cmd, { unitId: self.cache.unitId, unitCode: self.cache.unitCode, callback: function(result, protocol) {
                    console.log('state restored');
                }});

                //console.log('start learn..');
                //self.command('protocol:learn', { unitId: unitId, unitCode: unitCode, callback: function(result, protocol) {
                //    console.log('..learned');
                //}});
                args.callback(true);
            } else {
                args.callback(true);    
            }
        },
        poll: function(args) {
            var self = this;
            //var unitId = self.functions.numToHexArray(self.setting('unitid'), 4);
            //var unitCode = self.setting('unitcode');

            //console.log('on/off start');
            //self.command('protocol:on', { unitId: unitId, unitCode: unitCode, callback: function(result, protocol) { }});
            //setTimeout(function() {
            //    self.command('protocol:off', { unitId: unitId, unitCode: unitCode, callback: function(result, protocol) {
            //        console.log('on/off end');
            //    }});
            //}, 1000);

            args.callback(true);
        },
        setState: function(args) {
            var self = this;
            if (args) {
                self.setting('state', args.state);
            }
        }
    },
    functions: {
        numToHexArray: function(number, length) {
            var result = [];
            var hex = number.toString(16);
            var pos = length * 2;
            while (hex < pos) { hex = '0' + hex; }
            for (var i = 0; i < length; i++) {
                var pos = i * 2; 
                var val = hex.slice(pos, pos + 2);
                result.push(val);
            }
            return result;
        }    
    }
}});