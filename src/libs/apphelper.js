define(['fs', 'http', 'express', 'connect-flash', 'controllers/main', 'controllers/authorization', 'controllers/interface', 'controllers/socket', 'controllers/routes', '../libs/configuration', '../libs/store'], function(fs, Http, Express, Flash, Main, Authorization, Interface, Socket, Routes, Config, Store) {

    var factory = function(app) {
        this.app = app;
    };

    factory.prototype.init = function() {
        var self = this;

        // logging
        if (!fs.existsSync('logs')) { fs.mkdirSync('logs'); }
        var env = (process.argv && process.argv[2] == 'dev') ? 'dev' : 'prod'; //process.env.NODE_ENV || 'dev';
        var devMode =  (env == 'dev') ? true : false;
        var logLevel = (env == 'dev') ? 'silly' : 'info';
        var winston = require('winston');
        var logger = new (winston.Logger)({ // silly=0, verbose=1, info=2, warn=3, debug=4, error=5
            transports: [
                new (winston.transports.Console)({ colorize: true, level: logLevel }),
                new (winston.transports.File)({ colorize: true, filename: './logs/main.log', level: logLevel })
            ]
        });
        self.app.set('logger', logger);
        self.app.set('debug', devMode);

        // configuration
        Config.read();
        self.app.set('config', Config);

        // data
        Store.open();
        self.app.set('store', Store);

        // main functions
        self.app.set('main', new Main(self.app));

        // server
        var server = Http.createServer(self.app);
        self.app.set('server', server);
        self.app.set('socket', new Socket(self.app));
        //self.app.use(Express.logger());
        self.app.use(Express.cookieParser());
        //self.app.use(Express.bodyParser());
        self.app.use(Express.json());
        self.app.use(Express.urlencoded());
        self.app.use(Express.methodOverride());
        self.app.use(Flash());

        // sessions
        var sessionStore = self.app.get('store').get('sessions');
        var session = { secret: 'yoursecret', key: 'yoursessionkey', cookie: { path: '/', httpOnly: true, maxAge: 365 * 24 * 3600 * 1000 }, store: sessionStore };
        self.app.set('sessionstore', sessionStore); 
        self.app.use(Express.session(session));

        // authorization
        self.app.set('authorization', new Authorization(self.app));

        // interface
        self.app.set('interface', new Interface(self.app));

        // routes
        self.app.use(Express.static('./public'));
        Routes.init(self.app);

    };
    
    factory.prototype.start = function() {
        var app = this.app;

        var config = app.get('config');
        var port = config.get('server:port');

        var main = app.get('main');
        main.start(null, function(result) {
            if (result) {
                var server = app.get('server');
                server.listen(port, function() {
                    main.log('info', 'HabiThings successfully started');
                    var ip = require('../libs/ip').address();
                    main.log('info', 'Please connect with your browser to: http://%s:%s', ip, port);
                    if (app.get('debug')) { main.log('warn', 'Running in development mode'); }
                });
            }    
        });

    };
    
    var exports = factory;
    return exports;
});
