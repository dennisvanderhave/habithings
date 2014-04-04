define(['underscore', 'passport', 'passport.socketio', 'passport-local'], function(_, Passport, PassportSocketIO, PassportLocal) {
    var controller = function(app) {
        var self = this;
        self.app = app;
        self.funcs = app.get('main');

        // strategies
        var LocalStrategy = PassportLocal.Strategy;
        Passport.use(new LocalStrategy(
            function(username, password, callback) {
                var funcs = self.app.get('main'); 
                funcs.users.getByLogin(username, function(users) {
                    var user = (users.length > 0) ? users.models[0] : null;
                    //if (!user) { return callback(null, false, { message: 'Unknown user.' }); }
                    //if (user.get('pass') != password) { return callback(null, false, { message: 'Incorrect password.' }); }
                    //if (!user.get('enabled')) { return callback(null, false, { message: 'Incorrect password.' }); }
                    if (user && user.get('pass') == password && user.get('enabled')) {
                        return callback(null, user); 
                    } else {
                        return callback(null, false, { message: 'Login failed.' });
                    }
                });
                //console.log('authenticate?');
                //if (username == 'admin' && password == 'admin') {
                //    var user = { id: 1, username: 'admin', password: 'admin' };
                //    return done(null, user);
                //} else {
                //    return done('Invalid user.');
                //}
            }
        ));

        Passport.serializeUser(function(user, done) {
          done(null, user.id);
        });
        Passport.deserializeUser(function(id, done) {
            var funcs = self.app.get('main'); 
            funcs.users.getById(id, function(users) {
                var user = (users.length > 0) ? users.models[0] : null;
                if (user && user.get('enabled')) {
                    done(null, user);    
                } else {
                    done(null, false);
                }
            });
        });

        // socket.io
        var auth = PassportSocketIO.authorize({
            cookieParser: require('express').cookieParser,
            key:         'yoursessionkey',                  // the name of the cookie where express/connect stores its session_id
            secret:      'yoursecret',                      // the session_secret to parse the cookie
            store:       app.get('sessionstore'),           // we NEED to use a sessionstore. no memorystore please
            success:     self.onSockAuthorizeSuccess,       // *optional* callback on success - read more below
            fail:        self.onSockAuthorizeFail,          // *optional* callback on fail/error - read more below
        });
        var io = app.get('socket').io;
        io.set('authorization', auth);

        app.use(Passport.initialize());
        app.use(Passport.session());
    };

    controller.prototype.authenticate = function(req, res, callback) {
        Passport.authenticate('local', function(err, user, info) {
            if (!err && user && callback) { 
                callback(user) 
            } else {
                if (callback) { callback(); }
            }
        })(req, res);
    };

    controller.prototype.checkPermission = function(code, srcType, srcId, destType, destId) {
        // system / device / task / ((area*))
        var self = this;

        // get source permissions
        var perms = self.getPermissions(srcType, srcId);

        // check <code> for 'all' of 'system'
        if (perms.filterByDestination('system', 'all').filterByHasCode(code).length > 0) {
            return true;
        }

        // check <code> for 'all' of <destType>
        if (perms.filterByDestination(destType, 'all').filterByHasCode(code).length > 0) {
            return true;
        }

        // check <code> for <destId> of <destType>
        if (perms.filterByDestination(destType, destId).filterByHasCode(code).length > 0) {
            return true;
        }

        // no rights? => bummer
        return false;
    };
    controller.prototype.checkUserPermission = function(code, userId, destType, destId) {
        var self = this;
        return self.checkPermission(code, 'user', userId, destType, destId);
    };
    controller.prototype.getPermissions = function(type, id) {
        var self = this;
        var perms;

        // get permissions for current user / group
        perms = self.funcs.permissions.filterBySource(type, id).filterByEnabled(true);

        // if we're checking for a user, get it's group(s) permissions
        if (type == 'user') {
            var user = self.funcs.users.get(id);
            if (user) {
                var groupIds = user.get('groups') || [];
                _.each(groupIds, function(groupId) {
                    var tmpPerms = self.funcs.permissions.filterBySource('group', groupId).filterByEnabled(true);
                    if (tmpPerms.length > 0) { perms.add(tmpPerms.toJSON()); }
                });
            }
        }

        return perms;
    };

    controller.prototype.deserializeUser = function (id, callback) {
        var self = this;
        var funcs = self.app.get('main'); 
        funcs.users.getById(id, function(users) {
            var user = (users.length > 0) ? users.models[0] : null;
            if (user && user.get('enabled')) {
                callback(null, user);    
            } else {
                callback(null);
            }
        });
        //var user = { id: 1, username: 'admin', password: 'admin' };
        //callback(null, user);
    };
    controller.prototype.onSockAuthorizeFail = function (data, message, error, callback) {
        if (error) throw new Error(message);
        callback (null, false);    
    };
    controller.prototype.onSockAuthorizeSuccess = function (data, callback) {
        callback(null, true);
    };
    controller.prototype.serializeUser = function (user, callback) {
        callback (null, user.id);
    };

    var exports = controller;
    return exports;
});
