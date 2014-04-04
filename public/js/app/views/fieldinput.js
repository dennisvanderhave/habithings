 define(['jquery', 'underscore', 'backbone', 'views/baseview', 'views/input'], function ($, _, Backbone, BaseView, Input) {
    return BaseView.extend({
        className: 'fieldinputview',
        modelEvents: {
            'change': 'refreshField'    
        },
        template: function () {
            var self = this;
            var tpl = '';
            return tpl;
        },
        onInitialize: function () {
            var self = this;

            self.model = self.model || self.options.entity;
            self.field = self.field || self.options.field;
            
            var fields = self.model.get('fields') || {};
            var field = fields[self.field];
            if (self.model && self.field && field) {
                var isEditable = (field.trigger || field.editable) ? true : false;
                var opt = {};
                if (field.trigger) { 
                    var value = self.model.link(self.field);
                    opt = _.extend(opt, { type: 'trigger', value: value, readonly: !isEditable, exclude: [self.model.id] }); 
                } else if (field.select) { 
                    var value = self.model.setting(self.field);
                    opt = _.extend(opt, { type: 'list', value: value, items: field.select, readonly: !isEditable }); 
                } else if (_.contains(['number'], field.type)) {
                    var value = self.model.setting(self.field);
                    opt = _.extend(opt, { type: field.type, value: value, readonly: !isEditable }); 
                } else {
                    var value = self.model.setting(self.field);
                    opt = _.extend(opt, { type: 'text', value: value, readonly: !isEditable }); 
                }                
                self._input = self._input || new Input(opt);
                self._input.on('input:change', function(args) { 
                    if (args && args.value) {
                        var mod = this.model; 
                        if (field.trigger) {
                            mod.link(self.field, args.value);
                            var item = self.app.main.getEntity(args.value.type, args.value.uuid);
                            if (item) { 
                                var value = item.setting(args.value.trigger);
                                mod.setting(self.field, value);
                            }
                        } else {
                            mod.setting(self.field, args.value);
                        }
                        mod.save();
                    }
                }, self);
            }
                
        },
        refreshField: function(model) {
            var self = this;
            var fields = self.model.get('fields') || {};
            var field = fields[self.field];
            var value = (field.trigger) ? self.model.link(self.field) : self.model.setting(self.field);
            self._input.setValue(value)
        },
        onRender: function () {
            var self = this;
            self.$el.append(self._input.render().el);
        }
    });
});