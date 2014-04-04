define(['underscore', 'views/baseview', 'views/device'], function (_, BaseView, DeviceView) {
    return BaseView.extend({
        className: 'dashboardview',
        ui: {
            //devices: 'div[data-id="devicecontainer"]'
        },
        template: function () {
            var self = this;
            var tpl = '';

            tpl += '<div class="container-fluid">';
            tpl += '  <div class="row">';


            //tpl += '    <div data-id="taskcontainer" class="col-sm-6"></div>';
            //tpl += '    <div data-id="devicecontainer" class="col-sm-6"></div>';
            tpl += '    <div data-id="devicecontainer" class="col-sm-12">';


            //tpl += '<div class="panel panel-info panelstyle1">';
            //tpl += '  <div class="panel-heading">test</div>';
            //tpl += '  <div class="panel-body">';
            //tpl += '  </div>';
            //tpl += '</div>';


            tpl += '    </div>';
            tpl += '  </div>';
            tpl += '</div>';

            // message area
            //tpl += '  <div class="row">';
            //tpl += '    <div class="col-xs-12">';
            //tpl += '      <div class="alert alert-warning alert-dismissable">';
            //tpl += '        <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
            //tpl += '        <strong>Warning!</strong> Better check yourself, youre not looking too good.';
            //tpl += '      </div>';
            //tpl += '    </div>';
            //tpl += '  </div>';

            return _.template(tpl);
        },
        onInitialize: function (options) {
            var self = this;
            self.collection = self.app.store.get('devices');
        },
        onRender: function () {
            var self = this;

            self.collection.each(function(model) {
                //var tpl = '<div data-cid="' + model.cid + '" class="col-xs-12 col-sm-4"></div>';
                //self.ui.devices.append(tpl);

                tpl = new DeviceView({ model: model, viewmode: 'info' }).render().el;
                self.$el.find('div.panel-body').append(tpl);

                //self.$el.find('div[data-cid="' + model.cid + '"]').append(tpl);
            });
        }
    });
});