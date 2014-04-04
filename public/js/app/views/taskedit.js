define(['underscore', 'backbone', 'moment',  'views/baseview', 'views/list', 'views/fieldinput', 'views/input'], function (_, Backbone, moment, BaseView, List, FieldInput, Input) {
    return BaseView.extend({
        className: 'taskeditview',
        events: {},
        modelEvents: {
            'change': 'refreshModel'    
        },
        ui: {},
        template: function () {
            var self = this;
            var tpl = '';

            tpl += '  <div class="row">';
            tpl += '    <div data-id="info" class="col-xs-12">';
            tpl += '      <div>';
            tpl += '        <i class="icon icon-fw icon-lg"></i>';
            tpl += '        <span></span>';
            tpl += '      </div>';
            tpl += '    </div>';
            tpl += '  </div>';
            tpl += '  <div class="row">';
            tpl += '    <div data-id="menu" class="col-xs-12">';
            tpl += '      <div class="tabstyle1">';
            tpl += '        <ul class="nav nav-tabs">';
            tpl += '          <li class="active"><a href="#taskedit_info" data-toggle="tab">Info</a></li>';
            tpl += '          <li><a href="#taskedit_fields" data-toggle="tab">Fields</a></li>';
            tpl += '        </ul>';
            tpl += '        <div class="tab-content">';
            tpl += '          <div class="tab-pane fade in active" id="taskedit_info"></div>';
            tpl += '          <div class="tab-pane fade" id="taskedit_fields"></div>';
            tpl += '        </div>';
            tpl += '      </div>';
            tpl += '    </div>';
            tpl += '  </div>';

            //tpl += '</div>';

            return tpl;
        },
        refreshModel: function(model) {
            var self = this;
            var panel;

            // generic
            panel = self.$el.find('div[data-id="info"]');
            panel.find('>div>i').addClass('icon-' + model.get('icon'));
            panel.find('>div>span').html(model.get('name'));

            // info
            if (self._infoList.collection.length <= 0) {
                var infoItems = [];
                infoItems.push({ id: 'name', label: 'Name', description: 'Name', value: model.get('name'), editable: true });
                infoItems.push({ id: 'version', label: 'Version', description: 'Version', value: model.get('version'), editable: false });
                self._infoList.collection.set(infoItems);
            }
            
        },
        onInitialize: function (options) {
            var self = this;
            
            // tabs
            self.options.viewmode = self.options.viewmode || 'info';
            if (!self.model && self.options.id) {  
                self.model = self.app.store.get('tasks').get(self.options.id);
            }

            self._infoList = new List({
                classStyle: 'liststyle1',
                collection: new Backbone.Collection(),
                onItemRender: self.onListInfoItemRender,
                onItemAfterRender: self.onListInfoItemAfterRender
            });

            // fields 
            var colFields = new Backbone.Collection();
            var fields = self.model.get('fields') || {};
            _.each(_.keys(fields), function(key) {
                colFields.add({ id: key, label: fields[key].label });
            });
            self._fieldsList = new List({
                classStyle: 'liststyle1 form-horizontal',
                collection: colFields,
                onItemRender: self.onListFieldItemRender,
                onItemAfterRender: self.onListFieldItemAfterRender
            });

        },
        onListFieldItemRender: function (model) {
            var self = this;
            var tpl = '';
            tpl += '<div class="row">';
            tpl += '  <div data-col="label" class="col-sm-4"><span><strong>' + model.get('label') + ':</strong></span></div>';
            tpl += '  <div data-col="input" class="col-sm-8"></div>';
            tpl += '</div>';
            return tpl;
        },
        onListFieldItemAfterRender: function (model, el) {
            var self = this;
            var input = new FieldInput({ entity: self.model, field: model.get('id') });
            if (input) {
                var inp = input.render().el;
                el.find('div[data-col="input"]').html('');
                el.find('div[data-col="input"]').append(inp);
            }
        },
        onListInfoItemRender: function (model) {
            var self = this;
            var tpl = '';
            tpl += '<div class="row">';
            tpl += '  <div data-col="label" class="col-sm-4"><span><strong>' + model.get('label') + ':</strong></span></div>';
            tpl += '  <div data-col="input" class="col-sm-8"></div>';
            tpl += '</div>';
            return tpl;
        },
        onListInfoItemAfterRender: function (model, el) {
            var self = this;

            var isEditable = (model.get('editable')) ? true : false;
            var field = model.get('id');
            var value = self.model.get(field) || '';
            var opt = { type: 'text', value: value, readonly: !isEditable };
            var input = new Input(opt);
            input.on('input:change', function(args) { 
                if (args && args.value) { 
                    this.model.set(field, args.value);
                    this.model.save();
                }
            }, self);
            var inp = input.render().el;
            el.find('div[data-col="input"]').append(inp);
        
        },
        onRender: function () {
            var self = this;

            if (!self.$el.find('#taskedit_info').html()) {
                self.$el.find('#taskedit_info').append(self._infoList.render().el);
            }
            if (!self.$el.find('#taskedit_fields').html()) {
                self.$el.find('#taskedit_fields').append(self._fieldsList.render().el);
            }

            self.refreshModel(self.model);
        }
    });
});
