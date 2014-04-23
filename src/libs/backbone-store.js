define(['uuid', '../libs/store'], function(uuid, Store) {
    
    var factory = function(model, name) {
        var self = this;
        self.dbname = name;
        self.db = Store.get(name);
        model.store = self;
        model.sync = self.sync;
    };

    factory.prototype.create = function (model, success, error, options) {
        var self = this;
        var db = model.store.db;

        model.attributes[model.idAttribute] = uuid.v1();
        var data = model.toJSON();
        db.insert(data, function (err, result) {
            if (!err) {
                if (success) { success(result); }
            } else {
                error(err);
            }  
        });
    }

    factory.prototype.destroy = function (model, success, error, options) {
        var self = this;
        var db = model.store.db;

        var key = model.attributes[model.idAttribute];
        var search = {}; search[model.idAttribute] = key;
        db.remove(search, { multi: true }, function (err, count) {
            if (!err) {
                if (success) { success(count); }
            } else {
                error(err);
            }  
        });  
    }

    factory.prototype.read = function (model, success, error, options) {
        var self = this;
        var db = model.store.db;
        var isCollection = (model.attributes) ? false : true;

        if (isCollection) {
            var search = options.data || {};
            db.find(search, function (err, result) {
                if (!err) {
                    if (success) { success(result); }
                } else {
                    error(err);
                }  
            });
        } else {
            var key = model.attributes[model.idAttribute];
            var search = {}; search[model.idAttribute] = key;
            db.findOne(search, function (err, result) {
                if (!err) {
                    if (success) { success(result); }
                } else {
                    error(err);
                }  
            });
        }

    }

    factory.prototype.sync = function (method, model, options) {
        var self = this;

        var store = model.store;
        var success = function (results) {
            if (options.success) { options.success(results); }
        };
        var error = function (error) {
            if (options.error) { options.error(error); }
        };
        switch (method) {
            case "read":
                store.read(model, success, error, options);
                break;
            case "create":
                store.create(model, success, error, options);
                break;
            case "update":
                store.update(model, success, error, options);
                break;
            case "delete":
                store.destroy(model, success, error, options);
                break;
            default:
                //self.error(method);
        }

    }

    factory.prototype.update = function (model, success, error, options) {
        var self = this;
        var db = model.store.db;

        var key = model.attributes[model.idAttribute];
        var search = {}; search[model.idAttribute] = key;
        var data = model.toJSON();

        db.count(search, function (err, count) {
            if (!err) {
                if (count > 0) {
                    db.update(search, data, {}, function (err, count) {
                        if (!err) {
                            if (success) { success(data); }
                        } else {
                            error(err);
                        }  
                    });                    
                } else {
                    db.insert(data, function (err, result) {
                        if (!err) {
                            if (success) { success(result); }
                        } else {
                            error(err);
                        }  
                    });
                }
            } else {
                error(err);
            }    
        });


    }

    var exports = factory;
    return exports;
});
