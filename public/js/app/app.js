define(['backbone', 'marionette', 'controllers/store', 'controllers/socket', 'controllers/main', 'helpers/main'],
    function (Backbone, Marionette, StoreController, SocketController, MainController, MainHelper) {
        var App = new Marionette.Application();

        // regions
        App.addRegions({
            dialogRegion: "#dialog",
            headerRegion: "#header",
            menuRegion: "#menu",
            mainRegion: "#main"
        });

        App.addInitializer(function (options) {
            App.store = new StoreController();
            App.main = new MainHelper(App);
            App.socket = new SocketController();
        });

        App.addInitializer(function (options) {
            // preload libraries
            require(['bootstrap', 'jquery.hammer', 'jquery.tinysort'],
                function () {
                    // handle resize
                    window.addEventListener('resize', App.main.onResize, false);
                    App.main.onResize();
                }
            );
        });

        // routes
        App.addInitializer(function (options) {
            var AppRouter = Backbone.Marionette.AppRouter.extend({
                appRoutes: {
                    '': 'home',
                    'home': 'home',
                    'dashboard(/*params)': 'dashboard',
                    'device(/*params)': 'device',
                    'deviceadd(/*params)': 'deviceadd',
                    'deviceedit(/*params)': 'deviceedit',
                    'devices(/*params)': 'devices',
                    'login(/*params)': 'login',
                    'settings(/*params)': 'settings',
                    'taskadd(/*params)': 'taskadd',
                    'taskedit(/*params)': 'taskedit',
                    'tasks(/*params)': 'tasks'
                }
            });
            var controller = new MainController();
            App.appRouter = new AppRouter({ controller: controller });
        });

        // finish start
        App.addInitializer(function (options) {
            App.store.refreshAll(function() {
                // and start the router
                if (!Backbone.History.started) {
                    Backbone.history.start();
                }
            });
        });

        return App;
    });