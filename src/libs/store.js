define(['nedb', 'connect-nedb-session', 'express'], function(nedb, nedbsessionstore, Express) {
    var factory =  {
        items: {}
    };

    factory.get = function (item) {
        return factory.items[item];
    }

    factory.open = function (callback) {
        var NEDBSS = nedbsessionstore(Express);

        factory.items.plugins = new nedb({ filename: './data/plugins.db', autoload: true });
        factory.items.protocols = new nedb({ filename: './data/protocols.db', autoload: true });
        factory.items.devices = new nedb({ filename: './data/devices.db', autoload: true });
        factory.items.tasks = new nedb({ filename: './data/tasks.db', autoload: true });
        factory.items.usergroups = new nedb({ filename: './data/usergroups.db', autoload: true });
        factory.items.users = new nedb({ filename: './data/users.db', autoload: true });
        factory.items.permissions = new nedb({ filename: './data/permissions.db', autoload: true });
        factory.items.sessions = new NEDBSS({ filename: './data/sessions.db' });
        
        factory.items.plugins.ensureIndex({ fieldName: 'uuid', unique: true }, function (err) {
            factory.items.protocols.ensureIndex({ fieldName: 'uuid', unique: true }, function (err) {
                factory.items.devices.ensureIndex({ fieldName: 'uuid', unique: true }, function (err) {
                    factory.items.tasks.ensureIndex({ fieldName: 'uuid', unique: true }, function (err) {
                        factory.items.usergroups.ensureIndex({ fieldName: 'uuid', unique: true }, function (err) {
                            factory.items.users.ensureIndex({ fieldName: 'uuid', unique: true }, function (err) {
                                factory.items.permissions.ensureIndex({ fieldName: 'uuid', unique: true }, function (err) {
                                    if (callback) { callback(); }
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    return factory;
});
