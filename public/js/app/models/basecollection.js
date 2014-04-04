define(['underscore', 'backbone'], function (_, Backbone) {
    var col = Backbone.Collection.extend({
        filterByAttribute: function (attrib, value, partial, limit) {
            var self = this;
            // init
            var attribs = [];
            if (attrib) {
                if (_.isArray(attrib)) { attribs = attrib } else { attribs.push(attrib); };
            }
            var values = [];
            if (value) {
                if (_.isArray(value)) { values = value } else { values.push(value); };
            }
            partial = partial || false;
            // filter
            var filtered = self.filter(function (item) {
                var isItem = false;
                _.each(attribs, function (a) {
                    _.each(values, function (v) {
                        var al = item.get(a).toString().toLowerCase();
                        var vl = v.toString().toLowerCase();
                        if (partial && al.indexOf(vl) >= 0) {
                            isItem = true;
                        } else if (!partial && al == vl) {
                            isItem = true;
                        }
                    });
                });
                return (isItem);
            });
            // limit result
            if (limit && filtered.length > limit) { filtered = _.first(filtered, limit); }
            return new self.constructor(filtered);
        },
        getAll: function (callback) {
            var self = this;
            self.fetch({
                reset: true,
                success: function(result) {
                    if (callback) { callback(result); }
                },
                error: function() {
                    if (callback) { callback(); }
                }
            });
        },
        getByAttribute: function (attrib, value, callback) {
            var self = this;
            var data = {};
            data[attrib] = value;
            self.fetch({
                reset: true,
                data: data,
                success: function(result) {
                    if (callback) { callback(result); }
                },
                error: function() {
                    if (callback) { callback(); }
                }
            });
        }        
    });
    return col;
});


