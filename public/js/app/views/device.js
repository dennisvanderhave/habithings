define(['underscore', 'backbone', 'views/baseview', 'views/list'], function (_, Backbone, BaseView, List) {
    return BaseView.extend({
        className: 'deviceview',
        events: {},
        modelEvents: {
            'change': 'onModelChange'
        },
        template: function () {
            var self = this;
            var tpl = '';
            var tpl_viewmode = 'template_' + self.options.viewmode;
            if (self[tpl_viewmode]) { tpl += self[tpl_viewmode].apply(); }
            return _.template(tpl);
        },
        template_info: function() {
            var self = this;
            var tpl = '';
            tpl += '<div class="touchgrid">';
            tpl += '  <div data-id="icon" class="tgd-cell tgd-cell-h2 tgd-cell-w2"><i class="icon icon-3x icon-fw"></i></div>';
            tpl += '  <div data-id="name" class="tgd-cell tgd-cell-h1 tgd-cell-w4 tgd-cell-x3 tgd-cell-y1"><span></span></div>';
            tpl += '  <div data-id="manufacturer" class="tgd-cell tgd-cell-h1 tgd-cell-w4 tgd-cell-x3 tgd-cell-y2"><span></span></div>';
            tpl += '</div>';
            return tpl;    
        },
        onInitialize: function (options) {
            var self = this;

            self.options.viewmode = self.options.viewmode || 'info';
            if (!self.model && self.options.id) {  
                self.model = self.app.store.get('devices').get(self.options.id);
            }
        },
        onModelChange: function() {
            var self = this;

            //var items = [];
            //items.push({ id: 'name', label: 'Name', value: self.model.get('name') });
            //items.push({ id: 'manufacturer', label: 'Manufacturer', value: self.model.get('manufacturer') });
            //self._list.collection.set(items);

            if (self.model) {
                if (self.options.viewmode == 'info') {
                    //self.$el.find('div[data-id="icon"]>i').addClass('icon-' + self.model.get('icon'));
                    self.$el.find('div[data-id="name"]>span').html(self.model.get('name'));
                    self.$el.find('div[data-id="manufacturer"]>span').html(self.model.get('manufacturer'));
                }

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
            }
        },
        onRender: function () {
            var self = this;

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



//define(['underscore', 'views/baseview'], function (_, BaseView) {
//    return BaseView.extend({
//        className: 'deviceview',
//        modelEvents: {
//            'change': 'onModelChange'
//        },
//        ui: {
//            title: 'div[data-id="title"]',
//            desc: 'div[data-id="desc"]',
//            icon: 'div[data-id="icon"]'
//        },
//        template: function () {
//            var self = this;
//            var tpl = '';

//            tpl += '<div class="panel panel-default">';
//            tpl += '  <div class="panel-body">';
//            tpl += '    <div data-id="icon"><i class="icon icon-3x icon-fw"></i></div>';
//            //tpl += '    <div data-id="info">';
//            tpl += '      <div data-id="title"></div>';
//            tpl += '      <div data-id="desc"></div>';
//            //tpl += '    </div>';
//            tpl += '  </div>';
//            tpl += '</div>';

//            return _.template(tpl);
//        },
//        onInitialize: function () {
//            var self = this;
//            if (!self.model && self.options.id) {  
//                self.model = self.app.store.get('devices').get('self.options.id');
//            }
//        },
//        onModelChange: function() {
//            var self = this;
//            if (self.model) {
//                self.ui.title.html(self.model.get('name'));
//                self.ui.desc.html(self.model.get('lastPoll'));
                
//                var clsIcon = 'icon-' + self.model.get('icon');
//                clsIcon += (self.model.get('active')) ? ' text-success' : ' text-danger';
//                self.ui.icon.find('i').addClass(clsIcon);

//            } else {
//                self.ui.title.html('');
//                self.ui.desc.html('');
//            }
//        },
//        onRender: function () {
//            var self = this;
//            self.onModelChange();
//        }
//    });
//});