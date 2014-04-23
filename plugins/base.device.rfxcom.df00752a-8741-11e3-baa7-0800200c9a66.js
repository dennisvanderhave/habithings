define(function() { return {
    type: 'device',
    definition: {
        uuid: 'df00752a-8741-11e3-baa7-0800200c9a66',
        version: '0.0.1',
        name: 'RfxCom',
        icon: 'device',
        manufacturer: 'RfxCom',
        protocol: 'serial',
        fields: {
            devicetype: { label: 'Device type', description: 'The type of RfxCom device.', type: 'number', select: 'getDeviceTypes' },
            frequency: { label: 'Frequency', description: 'The frequency used by the device.', type: 'number', select: 'getDeviceFrequencies' },
            firmware: { label: 'Firmware version', description: 'The firmware version of the device.', type: 'number' },
            protocol_rfac: { label: 'AC protocol', description: 'Indicates if the AC protocol is used.', type: 'bit' }
        },
        triggers: {}
    },
    cache: {
        // local variables
        buffer: null,           // incoming serial communications message buffer
        cmdSequence: null,      // the id of the last command sent
        messages: null,         // messages sent to outgoing communications buffer
        // definitions
        deviceTypes: [
            { id: 0x01, name: 'RFXtrx315'},
            { id: 0x02, name: 'RFXrec433'},
            { id: 0x03, name: 'RFXtrx433'},
            { id: 0x04, name: 'RFXtrx868'}
        ],
        deviceFrequencies: [
            { id: 0x50, name: '310MHz', deviceType: 0x01 },
            { id: 0x51, name: '315MHz', deviceType: 0x01 },
            { id: 0x52, name: '433.92MHz', deviceType: 0x02 },
            { id: 0x53, name: '433.92MHz', deviceType: 0x03 },
            { id: 0x55, name: '868.00MHz', deviceType: 0x04 },
            { id: 0x56, name: '868.00MHz FSK', deviceType: 0x04 },
            { id: 0x57, name: '868.30MHz', deviceType: 0x04 },
            { id: 0x58, name: '868.30MHz FSK', deviceType: 0x04 },
            { id: 0x59, name: '868.35MHz', deviceType: 0x04 },
            { id: 0x5A, name: '868.35MHz FSK', deviceType: 0x04 },
            { id: 0x5B, name: '868.95MHz', deviceType: 0x04 }
        ],
        deviceProtocols: [
            { id: 0x01, code:'', name: 'Undecoded', posByte: 0x01, posBit: 0x80 },
            { id: 0x02, code:'', name: 'RFU6', posByte: 0x01, posBit: 0x40 },
            { id: 0x03, code:'', name: 'Byron SX', posByte: 0x01, posBit: 0x20 },
            { id: 0x04, code:'', name: 'RSL', posByte: 0x01, posBit: 0x10 },
            { id: 0x05, code:'', name: 'Lighting 4', posByte: 0x01, posBit: 0x08 },
            { id: 0x06, code:'', name: 'FineOffset / Viking', posByte: 0x01, posBit: 0x04 },
            { id: 0x07, code:'', name: 'Rubicson', posByte: 0x01, posBit: 0x02 },
            { id: 0x08, code:'', name: 'AE Blyss', posByte: 0x01, posBit: 0x01 },
            { id: 0x09, code:'', name: 'BlindsT1/T2/T3/T4', posByte: 0x02, posBit: 0x80 },
            { id: 0x0A, code:'', name: 'BlindsT0', posByte: 0x02, posBit: 0x40 },
            { id: 0x0B, code:'', name: 'ProGuard', posByte: 0x02, posBit: 0x20 },
            { id: 0x0C, code:'', name: 'FS20', posByte: 0x02, posBit: 0x10 },
            { id: 0x0D, code:'', name: 'La Crosse', posByte: 0x02, posBit: 0x08 },
            { id: 0x0E, code:'', name: 'Hideki/UPM', posByte: 0x02, posBit: 0x04 },
            { id: 0x0F, code:'', name: 'AD LighwaveRF', posByte: 0x02, posBit: 0x02 },
            { id: 0x10, code:'', name: 'Mertik', posByte: 0x02, posBit: 0x01 },
            { id: 0x11, code:'', name: 'Visionic', posByte: 0x03, posBit: 0x80 },
            { id: 0x12, code:'', name: 'ATI', posByte: 0x03, posBit: 0x40 },
            { id: 0x13, code:'', name: 'Oregon Scientific', posByte: 0x03, posBit: 0x20 },
            { id: 0x14, code:'', name: 'Meiantech', posByte: 0x03, posBit: 0x10 },
            { id: 0x15, code:'', name: 'HomeEasy EU', posByte: 0x03, posBit: 0x08 },
            { id: 0x16, code:'rfac', name: 'AC', posByte: 0x03, posBit: 0x04 },
            { id: 0x17, code:'', name: 'ARC', posByte: 0x03, posBit: 0x02 },
            { id: 0x18, code:'', name: 'X10', posByte: 0x03, posBit: 0x01 }
        ]

            //0x00 = ac 
            //0x01 = arc 
            //0x02 = ati 
            //0x03 = hideki/upm 
            //0x04 = lacrosse/viking 
            //0x05 = ad 
            //0x06 = mertik 
            //0x07 = oregon1 
            //0x08 = oregon2 
            //0x09 = oregon3 
            //0x0A = proguard 
            //0x0B = visonic 
            //0x0C = nec 
            //0x0D = fs20 
            //0x0E = reserved 
            //0x0F = blinds 
            //0x10 = rubicson 
            //0x11 = ae 
            //0x12 = fineoffset 
    },
    commands: {
        discover: function(args) {
            var self = this;
            var _ = require('underscore');
            self.functions.rfxOpen({ callback: function(resOpen, protocol) {
                if (resOpen.status) {
                    var prot = protocol;
                    self.functions.rfxInit({ protocol: prot, 
                        callback: function(resInit, protocol) {
                            if (resInit.status) {
                                setTimeout(function() {
                                    // give it some time for the data to arrive before we close up
                                    self.functions.rfxClose({ protocol: protocol });
                                }, 500);
                            } else {
                                self.functions.rfxClose({ protocol: prot });
                            }
                        },
                        response: function(message) {
                            var result = { protocol: prot, settings: {} };
                            // get device information
                            var frequency = _.findWhere(self.cache.deviceFrequencies, { id: message.data[1] });
                            if (frequency) {
                                var deviceType = _.findWhere(self.cache.deviceTypes, { id: frequency.deviceType });
                                result.name = self.definition.manufacturer + ' ' + deviceType.name;
                                args.callback(result);                                
                            }
                        }
                    });
                }
            }});
        },
        load: function(args) {
            var self = this;
            var _ = require('underscore');
            self.cache.buffer = [];
            self.cache.cmdSequence = 0;
            self.cache.messages = [];
            if (self.isInstance()) {
                self.functions.rfxOpen({ callback: function(resOpen, protocol) {
                    if (resOpen.status) {
                        self.functions.rfxInit({ response: function(message) {
                            // save device status settings
                            var frequency = _.findWhere(self.cache.deviceFrequencies, { id: message.data[1] });
                            if (frequency) {
                                var deviceType = _.findWhere(self.cache.deviceTypes, { id: frequency.deviceType });
                                self.setting('frequency', frequency.id);
                                self.setting('devicetype', deviceType.id);
                                self.setting('firmware', message.data[2]);
                                _.each(self.cache.deviceProtocols, function(devProt) {
                                    if (devProt.code) {
                                        var field = 3 + (devProt.posByte - 1);
                                        var enabled = (message.data[field] & devProt.posBit) ? true: false;
                                        self.setting('protocol_' + devProt.code, enabled);
                                        if (enabled) {
                                            // protocol interface
                                            self.command('interface:init', { 'code': devProt.code, 'interface': devProt.code, 'name': devProt.name });
                                        }
                                    }
                                });
                                if (args.callback) { args.callback(true); }                                            
                            } else {
                                if (args.callback) { args.callback(false); }
                            }
                        }});
                    } else {
                        if (args.callback) { args.callback(false); }
                    }
                }});
            } else {
                if (args.callback) { args.callback(true); }
            }
        },
        poll: function(args) {
            var self = this;
            self.functions.rfxGetStatus({ 
                callback: function(result, protocol) {
                    if (!result.status) { args.callback(false); }
                },
                response: function(message) {
                    args.callback(true);
                }
            });
        }
    },
    interfaces: {
        rfac: {
            learn: function(iface, args) {
                var self = this;
                var tmpArgs = { unitId: args.unitId, unitCode: args.unitCode, callback: function() {} };
                var tmr = setInterval(function(){
                    var arg1 = iface; var arg2 = tmpArgs;
                    self.interfaces.rfac.off(arg1, arg2);
                }, 500);
                setTimeout(function() {
                    clearInterval(tmr);
                    args.callback({ status: true });
                }, 5000);
            },
            off: function(iface, args) {
                var self = this;
                if (args && args.unitId && args.unitId.length == 4 && args.unitCode) {
                    var msgData = args.unitId.concat([args.unitCode]).concat([0x00, 0xF, 0x0]);
                    self.functions.rfxSendMessage(0x11, 0x00, msgData, { 
                        response: function(message) {
                            args.callback({ status: true });
                        }, 
                        callback: function(result, protocol) {
                            if (!result.status) { args.callback({ status: false }); }
                        }
                    }); 
                }
            },
            on: function(iface, args) {
                var self = this;
                if (args && args.unitId && args.unitId.length == 4 && args.unitCode) {
                    var msgData = args.unitId.concat([args.unitCode]).concat([0x01, 0xF, 0x0]);
                    self.functions.rfxSendMessage(0x11, 0x00, msgData, { 
                        response: function(message) {
                            args.callback({ status: true });
                        }, 
                        callback: function(result, protocol) {
                            if (!result.status) { args.callback({ status: false }); }
                        }
                    }); 
                }
            }
        }
    },
    protocol: {
        onData: function(args) {
            var self = this;
            if (args && args.data) {
                // add received data to the global buffer
                self.cache.buffer.push.apply(self.cache.buffer, args.data);
                // first byte contains data length
                while (self.cache.buffer.length > 0 && self.cache.buffer.length >= (self.cache.buffer[0] + 1)) {
                    // get message from buffer, then remove from buffer
                    var msg = self.cache.buffer.slice(0, self.cache.buffer[0] + 1);
                    var opt = { raw: msg.slice(), length: msg[0], type: msg[1], subType: msg[2], seqNbr: msg[3], data: msg.slice(4) }
                    self.functions.rfxMessageHandler(opt);
                    self.cache.buffer = self.cache.buffer.slice(self.cache.buffer[0] + 1);
                    // if the remaining message contains an invalid length, clean the buffer
                    if (self.cache.buffer.length > 0 && self.cache.buffer[0] < 5) {
                        self.cache.buffer = [];
                        break;
                    }
                }
            }
        },
        onOpen: function(args) {
            var self = this;
        }
    },
    functions: {
        getCmndSequence: function() {
            var self = this;
            self.cache.cmdSequence += 1;
            if (self.cache.cmdSequence > 256) self.cache.cmdSequence = 1;
            return self.cache.cmdSequence;
        },
        getDeviceFrequencies: function() {
            var self = this;
            var _ = require('underscore');
            return _.map(self.cache.deviceFrequencies, function(item){ return { id: item.id, label: item.name}; });
        },
        getDeviceTypes: function() {
            var self = this;
            var _ = require('underscore');
            return _.map(self.cache.deviceTypes, function(item){ return { id: item.id, label: item.name}; });
        },
        rfxClose: function(options) {
            var self = this;
            self.command('protocol:close', options);
        },
        rfxFlush: function(options) {
            var self = this;
            self.command('protocol:flush', options);
        },
        rfxGetStatus: function(options) {
            var self = this;
            self.functions.rfxSendMessage(0x00, 0x00, [2, 0, 0, 0, 0, 0, 0, 0, 0, 0], options);
        },
        rfxInit: function(options) {
            var self = this;
            self.functions.rfxReset({ protocol: options.protocol, callback: function(resReset, protocol) {
                if (resReset.status) {
                    setTimeout(function() {
                        self.functions.rfxFlush({ protocol: options.protocol, callback: function(resFlush, protocol) {
                            if (resFlush.status) {
                                self.functions.rfxGetStatus({ protocol: options.protocol, response: options.response, callback: function(resStatus, protocol) {
                                    if (options.callback) { options.callback(resStatus, protocol); }
                                }});                        
                            } else {
                                if (options.callback) { options.callback(resFlush, protocol); }
                            }
                        }});                        
                    }, 500);
                } else {
                     if (options.callback) { options.callback(resReset, protocol); }
                }
            }});
        },
        rfxMessageHandler: function(data) {
            var self = this;
            var _ = require('underscore');

            function logData(data, handled) {
                var out = '[RFXCOM] ' + ((handled) ? 'OK ' : '?? ');
                out = out + data.raw.join(':');
                self.log(out);
            }

            if (data.type == 0x01) {
                // 0x01 - interface message
                if (data.subType == 0x00) {
                    // 0x00 - response on a command (we stored it in cache)
                    var msg = _.findWhere(self.cache.messages, { id: data.seqNbr });
                    if (msg && msg.callback) {
                        logData(data, true);
                        msg.callback(data);        
                    }
                    var messages = _.filter(self.cache.messages, function(message) { return (message.id > data.seqNbr); });
                    self.cache.messages = messages;
                } else if (data.subType == 0xFF) {
                    // 0xFF - wrong command received
                    logData(data, false);
                } else {
                    logData(data, false);
                }
            } else if (data.type == 0x02) {
                // 0x02 - receiver / transmitter message
                if (data.subType == 0x00) {
                    // 0x00 - error
                    logData(data, false);
                    // error, receiver did not lock msg not used
                } else if (data.subType == 0x01) {
                    // 0x01 - response
                    var msg = _.findWhere(self.cache.messages, { id: data.seqNbr });
                    if (msg && msg.callback) {
                        logData(data, true);
                        msg.callback(data);        
                    }
                    var messages = _.filter(self.cache.messages, function(message) { return (message.id > data.seqNbr); });
                    self.cache.messages = messages;


                    // transmitter response
                    // "0":"ACK, transmit OK",
                    // "1":"ACK, but transmit started after 3 seconds delay anyway with RF receive data",
                    // "2":"NAK, transmitter did not lock on the requested transmit frequency",
                    // "3":"NAK, AC address zero in id1-id4 not allowed"
                } else {
                    logData(data, false);
                }
            } else if (data.type == 0x03) {
                // 0x03 - undecoded rf message
                logData(data, false);
            } else if (data.type == 0x10) {
                // 0x10 - lighting1 (X10, ARC, ELRO, Waveman, EMW200, IMPULS, RisingSun, Philips, Energenie, GDR2)
                
                // 0x00 = X10 lighting 
                // 0x01 = ARC 
                // 0x02 = ELRO AB400D (Flamingo) 
                // 0x03 = Waveman 
                // 0x04 = Chacon EMW200 
                // 0x05 = IMPULS 
                // 0x06 = RisingSun 
                // 0x07 = Philips SBC 
                // 0x08 = Energenie ENER010 
                // 0x09 = Energenie 5-gang 
                // 0x0A = COCO GDR2-2000R
                
                logData(data, false);
            } else if (data.type == 0x11) {
                // 0x11 - lighting2 (AC, HomeEasy EU, ANSLUT)
                if (data.subType == 0x00) {
                    // 0x00 - AC
                    logData(data, true);
                    var dataProt = _.findWhere(self.cache.deviceProtocols, { id: 0x16 });
                    var protCode = dataProt.code;

                    // 0: "Off",
                    // 1: "On",
                    // 2: "Set Level",
                    // 3: "Group Off",
                    // 4: "Group On",
                    // 5: "Set Group Level"

                    self.command('interface:' + protCode + ':onData', { data: data });
                } else if (data.subType == 0x01) {
                    // 0x01 - HomeEasy EU
                    logData(data, false);
                } else if (data.subType == 0x02) {
                    // 0x02 - ANSLUT
                    logData(data, false);
                } else {
                    logData(data, false);
                }

                // ---------------------

                // 0B 11 00 0B 00BBA6F2 01 01 0F 70

                // 0B 11 00 0B 00 BB A6 F2 01 01 0F 70
                // Packettype    = Lighting2    11
                // subtype       = AC           00
                // Sequence nbr  = 11           0B
                // ID            = 0BBA6F2      00 BB A6 F2
                // Unit          = 1            01
                // Command       = On           01
                // Level         = 100%         0F
                // Signal level  = 7            


                

                //var self = this,
                //    commands = {
                //        0: "Off",
                //        1: "On",
                //        2: "Set Level",
                //        3: "Group Off",
                //        4: "Group On",
                //        5: "Set Group Level"
                //    },
                //    subtype = data[0],
                //    seqnbr = data[1],
                //    idBytes = data.slice(2, 6),
                //    unitcode = data[6],
                //    command = commands[data[7]],
                //    level = data[8],
                //    rssi = (data[9] & 0xf0) >> 4,
                //    evt;

                //idBytes[0] &= ~0xfc; // "id1 : 2"
                //evt = {
                //    subtype: subtype,
                //    seqnbr: seqnbr,
                //    id: "0x" + self.dumpHex(idBytes, false).join(""),
                //    unitcode: unitcode,
                //    command: command,
                //    level: level,
                //    rssi: rssi
                //};


                //logData(data, false);
            } else {
                // unknown message
                logData(data, false);
            }
        },
        rfxSendMessage: function(type, subType, data, options) {
            var self = this;
            // create the buffer with the message to send
            var cmdSeq = self.functions.getCmndSequence();
            var bufferLen = data.length + 3;
		    var buffer = [bufferLen, type, subType, cmdSeq].concat(data);
            // add message to the global messages
            var msg = { id: cmdSeq, buffer: buffer };
            if (options && options.response) { msg.callback = options.response; }
            self.cache.messages.push(msg);
            // send the message
            var opt = { buffer: buffer };
            if (options && options.protocol) { opt.protocol = options.protocol; }
            if (options && options.callback) { opt.callback = options.callback; }
            self.command('protocol:write', opt);
        },
        rfxOpen: function(options) {
            var self = this;
            options.baudrate = 38400;
            self.command('protocol:open', options);
        },
        rfxReset: function(options) {
            var self = this;
            self.functions.rfxSendMessage(0x00, 0x00, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], options);
        }
    }
}});
