define(['underscore', 'backbone', 'marionette'], function (_, Backbone, Marionette) {
    return Backbone.Marionette.Controller.extend({
        _items: ['devices', 'tasks', 'plugins', 'protocols'],
        _refresh_item: function (item, callback) {
            var self = this;
            require(['models/' + item], function(Collection) {
                self[item] = new Collection();
                if (self[item].getAll) {
                    self[item].getAll(function() {
                        if (self[item].bindApi) { self[item].bindApi(); }
                        if (callback) { callback(); }    
                    });
                } else {
                    if (callback) { callback(); }    
                }
            });
        },
        _refresh_items: function (items, callback) {
            var self = this;
            if (items.length > 1) {
                var currItem = _.first(items);
                var restItems = _.rest(items);
                self._refresh_item(currItem, function () {
                    self._refresh_items(restItems, callback);
                });
            } else {
                self._refresh_item(items[0], function () {
                    if (callback) { callback(); }
                });
            }
        },
        initialize: function (options) {
            var self = this;
        },
        get: function (item) {
            var self = this;
            return self[item];
        },
        refresh: function (item, callback) {
            var self = this;
            if (item) {
                self._refresh_item(item, function () {
                    if (callback) { callback(); }
                });
            } else {
                self._refresh_items(self._items, function () {
                    if (callback) { callback(); }
                });
            }
        },
        refreshAll: function (callback) {
            var self = this;
            self._refresh_items(self._items, function () {
                if (callback) { callback(); }
            });
        },
        settings: {
            get: function (key) {
                return window.localStorage.getItem(key);
            },
            remove: function (key) {
                window.localStorage.removeItem(key);
            },
            set: function (key, value) {
                window.localStorage.setItem(key, value);
            }            
        }
    });
});