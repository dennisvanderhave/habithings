require.config({
    baseUrl: 'js/app',
    paths: {
        // helpers
        'vent': 'helpers/vent',
        // libraries
        'backbone': '../libs/backbone-1.1.1-min',
        'bootstrap': '../libs/bootstrap-3.1.1-min',
        'hammer': '../libs/hammer-1.0.5-min',
        'iscroll': '../libs/iscroll-5.1.1',
        'jquery': '../libs/jquery-2.1.0-min',
        'jquery.hammer': '../libs/jquery-hammer-1.0.5-min',
        'jquery.sidr': '../libs/jquery-sidr-1.2.1-min',
        'jquery.tinysort': '../libs/jquery-tinysort-1.5.6-min',
        'marionette': '../libs/backbone-marionette-1.6.2-min',
        'moment': '../libs/moment-2.5.1-min',
        'socketio': '../libs/socket.io-0.9.16-min',
        'underscore': '../libs/underscore-1.6.0-min'
    },
    shim: {
        'backbone': {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        },
        'bootstrap': {
            deps: ['jquery']
        },
        'iscroll': {
            exports: 'IScroll'
        },
        'jquery': {
            exports: 'jQuery'
        },
        'jquery.hammer': {
            deps: ['jquery', 'hammer'],
        },
        'jquery.sidr': {
            deps: ['jquery'],
        },
        'jquery.tinysort': {
            deps: ['jquery'],
        },
        'marionette': {
            deps: ['jquery', 'underscore', 'backbone'],
            exports: 'Marionette'
        },
        'underscore': {
            exports: '_'
        }
    }
});

require(['app'], function (App) {
    App.start();
});
