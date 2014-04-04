var requirejs = require('requirejs');
requirejs.config({
    baseUrl: 'src/app',
    paths: {
        'backbone-store': '../libs/backbone-store'
    },
    nodeRequire: require
});

requirejs(['express', '../libs/apphelper'], function (Express, AppHelper) {
    
    var app = Express();
    var appHelper = new AppHelper(app);
    appHelper.init();
    appHelper.start();

});
