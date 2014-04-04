define(['underscore', 'backbone', 'views/baseview'], function (_, Backbone, BaseView) {
    return BaseView.extend({
        className: 'panelview',
        events: {},
        modelEvents: {},
        ui: {},
        template: function () {
            var self = this;
            var tpl = '';

            tpl += '<div class="panel panel-info">';
            tpl += '  <div class="panel-heading">Paneltje</div>';
            tpl += '  <div class="panel-body touchgrid">';
            tpl += '    <div class="tgd-cell tgd-cell-h1 tgd-cell-w1"></div>'; // icon
            tpl += '    <div class="tgd-cell tgd-cell-h1 tgd-cell-w1 tgd-cell-x1 tgd-cell-y1"></div>';
            tpl += '  </div>';
            tpl += '</div>';

            //var tpl_viewmode = 'template_' + self.options.viewmode;
            //if (self[tpl_viewmode]) { tpl += self[tpl_viewmode].apply(); }
            //tpl += '    </div>';


            return _.template(tpl);
        },
        //template_info: function() {
        //    var self = this;
        //    var tpl = '';

        //    tpl += '<form class="form-horizontal" role="form">';
        //    tpl += '  <div class="form-group row">';
        //    tpl += '    <label class="col-sm-4 control-label">Name</label>';
        //    tpl += '    <span class="col-sm-8" data-id="name" style="padding-top: 7px;"></span>';
        //    tpl += '  </div>';
        //    tpl += '  <div class="form-group row">';
        //    tpl += '    <label class="col-sm-4 control-label">Manufacturer</label>';
        //    tpl += '    <span class="col-sm-8" data-id="manufacturer" style="padding-top: 7px;"></span>';
        //    tpl += '  </div>';
        //    tpl += '</form>';

        //    return tpl;    
        //},
        onInitialize: function (options) {
            var self = this;

            //self.options.viewmode = self.options.viewmode || 'info';

            //var navItems = [{}, {}];

            //if (!self.model && self.options.id) {  
            //    self.model = self.app.store.get('devices').get(self.options.id);
            //}

            //self._list = new List({
            //    classStyle: 'liststyle1',
            //    collection: new Backbone.Collection(),
            //    onItemRender: self.onListItemRender,
            //    onItemSelect: self.onListItemSelect,
            //    scope: self
            //});

        },
        onListItemRender: function (model) {
            var self = this;
            //var tpl = '';
            //tpl += '<div class="row">';
            //tpl += '  <div class="col-xs-4"><span>' + model.get('label') + '</span></div>';
            //tpl += '  <div class="col-xs-8"><span>' + model.get('value') + '</span></div>';
            //tpl += '</div>';
            //return tpl;
        },
        onListItemSelect: function (model) {
            var self = this;
            //self.goTo('device', 'id:' + model.id);
        },
        onModelChange: function() {
            var self = this;

            //var items = [];
            //items.push({ id: 'name', label: 'Name', value: self.model.get('name') });
            //items.push({ id: 'manufacturer', label: 'Manufacturer', value: self.model.get('manufacturer') });
            //self._list.collection.set(items);

            //if (self.model) {
            //    if (self.options.viewmode == 'info') {
            //        self.$el.find('span[data-id="name"]').html(self.model.get('name'));
            //        self.$el.find('span[data-id="manufacturer"]').html(self.model.get('manufacturer'));
            //    }

            //    //active: false
            //    //icon: "cpu"
            //    //id: "a4e87b12-94a9-11e3-96d3-118b4cc7a625"
            //    //version: "0.0.1"

            //    //self.ui.desc.html(self.model.get('lastPoll'));
            //    //var clsIcon = 'icon-' + self.model.get('icon');
            //    //clsIcon += (self.model.get('active')) ? ' text-success' : ' text-danger';
            //    //self.ui.icon.find('i').addClass(clsIcon);
            //    //self.$el.find('i[data-id="icon"]').addClass(clsIcon);

            //} else {
            //    //self.ui.title.html('');
            //    //self.ui.desc.html('');
            //}
        },
        onNavLinkClick: function(e) {
            var self = this;
            //var viewmode = e.currentTarget.dataset.viewmode;
            //if (viewmode) {
            //    self.goTo('device', 'id:' + self.options.id + '/viewmode:' + viewmode);
            //}
        },
        onRender: function () {
            var self = this;
            if (self.options.classStyle) { self.$el.addClass(self.options.classStyle); }

            //if (!self.$el.find('div[data-id="content"]').html()) {
            //    self.$el.find('div[data-id="content"]').append(self._list.render().el);
            //    self.onModelChange();
            //}

            //if (!self.model && self.options.id) {  
            //    self.model = self.app.store.get('devices').get(self.options.id);
            //    self.onModelChange();
            //}

        }
    });
});