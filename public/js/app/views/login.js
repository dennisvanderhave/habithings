define(['underscore', 'vent', 'views/baseview'], function (_, vent, BaseView) {
    return BaseView.extend({
        className: 'loginview',
        events: {
            'click button[data-id="login"]': 'onLoginClick' 
        },
        template: function () {
            var self = this;
            var tpl = '';
            tpl += '<div class="center-outer">';
            tpl += '  <div class="center-inner">';
            tpl += '    <div class="row">';
            tpl += '      <div class="col-xs-10 col-xs-offset-1 col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-4">';
            tpl += '        <div class="panel panel-primary">';
            tpl += '          <div class="panel-heading"><h3 class="panel-title">Login</h3></div>';
            tpl += '          <div class="panel-body container-fluid">';
            tpl += '            <div class="row">';
            tpl += '              <div class="col-xs-12">';
            tpl += '                <div class="input-group"><span class="input-group-addon"><i class="icon icon-fw icon-server"></i></span><input data-id="server" type="text" class="form-control" placeholder="Server address"></div>';
            tpl += '              </div>';
            tpl += '            </div>';
            tpl += '            <div class="row">';
            tpl += '              <div class="col-xs-12">';
            tpl += '                <div class="input-group"><span class="input-group-addon"><i class="icon icon-fw icon-user"></i></span><input data-id="username" type="text" class="form-control" placeholder="Username"></div>';
            tpl += '              </div>';
            tpl += '            </div>';
            tpl += '            <div class="row">';
            tpl += '              <div class="col-xs-12">';
            tpl += '                <div class="input-group"><span class="input-group-addon"><i class="icon icon-fw icon-lock"></i></span><input data-id="password" type="password" class="form-control" placeholder="Password"></div>';      
            tpl += '              </div>';
            tpl += '            </div>';
            tpl += '            <div class="row">';
            tpl += '              <div class="col-xs-6 col-xs-offset-6">';
            tpl += '                <button data-id="login" class="btn btn-primary pull-right" type="button">Login</button>';      
            tpl += '              </div>';
            tpl += '            </div>';
            tpl += '          </div>';
            tpl += '        </div>';
            tpl += '      </div>';
            tpl += '    </div>';
            tpl += '  </div>';
            tpl += '</div>';
            return _.template(tpl);
        },
        onInitialize: function () {
            var self = this;
        },
        onLoginClick: function(e) {
            var self = this;

            var server = self.$el.find('input[data-id="server"]').val();
            var username = self.$el.find('input[data-id="username"]').val();
            var password = self.$el.find('input[data-id="password"]').val();
            var options = { path: 'auth/login', type: 'POST', data: { username: username, password: password } };
            self.app.main.callServer(options, function(result) {
                if (result) {
                    vent.trigger('user:login', username);
                    self.goTo('home');
                } else {
                    vent.trigger('user:logout');
                    self.goTo('login');
                }
            });
        },
        onRender: function () {
            var self = this;

            var server = '';
            var serverAddress = self.app.store.settings.get('server_address');
            if (serverAddress) {
                server += serverAddress;    
                var serverPort = self.app.store.settings.get('server_port');
                if (serverPort) { server += ':' + serverPort; }
                self.$el.find('input[data-id="server"]').val(server);
            }

        }
    });
});