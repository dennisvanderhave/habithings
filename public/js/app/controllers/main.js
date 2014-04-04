define(['underscore', 'backbone', 'marionette'],
    function (_, Backbone, Marionette) {
        return Backbone.Marionette.Controller.extend({
            _header: null,
            _menu: null,
            _getParameters: function (str) {
                var result = {};
                if (!str) {
                    return result;
                }
                _.each(str.split('/'), function (element, index, list) {
                    if (element) {
                        var param = element.split(':');
                        var key = param[0];
                        var val = param[1];
                        if (val.indexOf(',') !== -1) {
                            val = val.split(',');
                        }
                        result[key] = val;
                    }
                });
                return result;
            },
            _switchMainView: function (name, params) {
                var self = this;
                var App = require('app');

                if (!self._header) {
                    require(['views/header'], function (HeaderView) {
                        self._header = new HeaderView();
                        App.headerRegion.show(self._header);
                    });
                }
                if (!self._menu) {
                    require(['views/menu'], function (MenuView) {
                        self._menu = new MenuView();
                        App.menuRegion.show(self._menu);
                    });
                }
                function showNewView(name, params) {
                    require(['views/' + name, 'vent'], function (NewView, vent) {
                        var myParams = self._getParameters(params);
                        var tmpView = new NewView(myParams);
                //        if (tmpView.transitionTime) {
                //            var clsTransTime = 'trans-' + tmpView.transitionTime;
                //            var clsTransShow = tmpView.transitionOpen || 'trans-fade-in';
                //            tmpView.$el.addClass(clsTransTime);
                //            tmpView.$el.addClass(clsTransShow);
                            tmpView.on('show', function () {
                                setTimeout(function () {
                //                    tmpView.$el.removeClass(clsTransShow);
                                }, 0);
                            });
                //        }
                        App.mainRegion.show(tmpView);
                        vent.trigger('app:view', name);
                    });
                }
                //if (App.mainRegion.currentView && App.mainRegion.currentView.transitionTime) {
                //    var clsTransTime = 'trans-' + App.mainRegion.currentView.transitionTime;
                //    var clsTransClose = App.mainRegion.currentView.transitionClose || 'trans-fade-out';
                //    App.mainRegion.currentView.$el.addClass(clsTransTime);
                //    App.mainRegion.currentView.$el.addClass(clsTransClose);
                //    setTimeout(function () {
                //        showNewView(name, params);
                //    }, App.mainRegion.currentView.transitionTime);
                //} else {
                    showNewView(name, params);
                //}


            },
            initialize: function (options) {
                //
            },
            home: function (params) {
                var self = this;
                self._switchMainView('home', params);
            },
            dashboard: function (params) {
                var self = this;
                self._switchMainView('dashboard', params);
            },
            device: function (params) {
                var self = this;
                self._switchMainView('device', params);
            },
            deviceadd: function (params) {
                var self = this;
                self._switchMainView('deviceadd', params);
            },
            deviceedit: function (params) {
                var self = this;
                self._switchMainView('deviceedit', params);
            },
            devices: function (params) {
                var self = this;
                self._switchMainView('devices', params);
            },
            login: function (params) {
                var self = this;
                self._switchMainView('login', params);
            },
            settings: function (params) {
                var self = this;
                self._switchMainView('settings', params);
            },
            taskadd: function (params) {
                var self = this;
                self._switchMainView('taskadd', params);
            },
            taskedit: function (params) {
                var self = this;
                self._switchMainView('taskedit', params);
            },
            tasks: function (params) {
                var self = this;
                self._switchMainView('tasks', params);
            }
        });
    });