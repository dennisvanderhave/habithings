define(['fs', 'nconf'], function(fs, nconf) {
    var factory = {};
    
    factory.get = function(key) {
        return nconf.get(key);
    }
    factory.read = function() {
        nconf.argv().env();
        nconf.defaults({
            'server': {
                'port': 8080
            }
        });
        nconf.save();
    }
    factory.set = function(key, value) {
        nconf.set(key, value);
        nconf.save();
    }
    factory.write = function() {
        nconf.save();
    }
    
    return factory;
});
