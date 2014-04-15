define(function() { return {
    type: 'device',
    definition: {
        uuid: 'df007528-8741-11e3-baa7-0800200c9a66',
        version: '0.0.1',
        name: 'Serial Port',
        icon: 'device',
        manufacturer: 'HabiThings',
        protocol: 'system',
        fields: {
            port: { label: 'Port identifier', description: 'The unique identifier for the serial port.', type: 'string', config: true }
        }
    },
    commands: {
        discover: function(args) {
            var self = this;
            var _ = require('underscore');
            self.command('protocol:getSerialPorts', { callback: function(result, protocol) {
                _.each(result, function(port) {
                    var optDevice = { 'name': port.name, protocol: protocol, settings: { port: port.id } };
                    args.callback(optDevice);
                });
            }});
        },
        load: function(args) {
            var self = this;
            var _ = require('underscore');
            // initialize
            self.command('protocol:getSerialPorts', { callback: function(result) {
                // serial interface
                var optProtocol = { 'code': 'serial', 'interface': 'serial', 'name': 'Serial' };
                self.command('interface:init', optProtocol);
                if (args.callback) { args.callback(true); }
            }});
        },
        poll: function(args) {
            var self = this;
            args.callback(true);
        }
    },
    interfaces: {
        serial: {
            close: function(iface, args) {
                var self = this;
                if (self._serialPort && self._open) {
                    self._serialPort.close(function(err) {
                        var success = (err) ? false : true; 
                        var result = { status: success };
                        if (err) { result.message = err.message; }
                        args.callback(result);
                    });
                }
            },
            flush: function(iface, args) {
                var self = this;
                if (self._serialPort && self._open) {
                    self._serialPort.flush(function(err) {
                        var success = (err) ? false : true; 
                        var result = { status: success };
                        if (err) { result.message = err.message; }
                        args.callback(result);
                    });
                }
            },
            open: function(iface, args) {
                var self = this;

                var port = self.setting('port');
                if (port && !self._open) {
                    var SerialPort = require('serialport').SerialPort;
                    var baudrate = (args && args.baudrate) || 9600;
                    self._serialPort = new SerialPort(port, { 
			            baudrate: baudrate,
                        parser: require('serialport').parsers.raw
		            }, false);

		            self._serialPort.on('open', function() {
                        self.command('interface:serial:onOpen');
		            });
		            self._serialPort.on('data', function(data) {
                        self.command('interface:serial:onData', { data: data });
		            });
		            self._serialPort.on('error', function(data) {
                        self.command('interface:serial:onError', { data: data });
		            });
		            self._serialPort.on('close', function() {
                        self.command('interface:serial:onClose');
		            });
                    self._serialPort.open(function(err) {
                        var success = (err) ? false : true; 
                        self._open = success;
                        var result = { status: success };
                        if (err) { result.message = err.message; }
                        args.callback(result);
                    });
                }

            },
            write: function(iface, args) {
                var self = this;
                if (self._serialPort && self._open && args.buffer) {
                    self._serialPort.write(args.buffer, function(err, data) {
                        var success = (err) ? false : true; 
                        var result = { status: success, data: data };
                        if (err) { result.message = err.message; }
                        if (args.callback) { args.callback(result); }
                    });
                } else {
                    var result = { status: false };
                    if (args.callback) { args.callback(result); }
                }
            }
        }
    }
    
}});
