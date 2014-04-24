define(['jquery', 'jquery.sidr', 'underscore', 'vent', 'views/baseview', 'views/menu'], function ($, sidr, _, vent, BaseView, Menu) {
    return BaseView.extend({
        className: 'headerview',
        events: {
            'click li[data-id="nav-login"]': 'onLoginClick'
        },
        template: function () {
            var self = this;
            var tpl = '';

            tpl += '<div class="navbarstyle1 row">';
            tpl += '  <div class="col-xs-5">';
            tpl += '    <ul class="nav nav-pills">';
            tpl += '      <li data-id="menu" class="visible-xs"><i class="icon icon-bars icon-2x"></i></li>';
            tpl += '    </ul>';
            tpl += '  </div>';
            tpl += '  <div class="col-xs-2"><div class=""></div></div>';
            tpl += '  <div class="col-xs-5"></div>';
            tpl += '</div>';

            //tpl += '<nav class="navbar navbarstyle1 navbar-fixed-top" role="navigation">';
            //tpl += '  <div class="container-fluid">';
            //tpl += '    <ul class="nav nav-main navbar-nav navbar-right">';
            //tpl += '      <li><a href="#dashboard"><i class="icon icon-fw icon-lg icon-gear"></i> Dashboard</a></li>';
            //tpl += '      <li><a href="#devices"><i class="icon icon-fw icon-lg icon-gear"></i> Devices</a></li>';
            //tpl += '      <li data-id="nav-user" class="dropdown" style="display: none;">';
            //tpl += '        <a href="javascript:void(0)" class="dropdown-toggle" data-toggle="dropdown"><i class="icon icon-lg icon-user"></i> Welcome <b class="caret"></b></a>';
            //tpl += '        <ul class="dropdown-menu">';
            //tpl += '          <li><a href="javascript:void(0)"><i class="icon icon-fw icon-lg icon-gear"></i> Settings</a></li>';
            //tpl += '          <li><a href="javascript:void(0)"><i class="icon icon-fw icon-lg icon-user"></i> Profile</a></li>';
            //tpl += '          <li class="divider"></li>';
            //tpl += '          <li><a href="logout.html"><i class="icon icon-fw icon-lg icon-on-off"></i> Logout</a></li>';
            //tpl += '        </ul>';
            //tpl += '      </li>';
            //tpl += '      <li data-id="nav-login" class="dropdown">';
            //tpl += '        <a href="javascript:void(0)" class="dropdown-toggle" data-toggle="dropdown"><i class="icon icon-lg icon-user"></i> Login</b></a>';
            //tpl += '      </li>';
            //tpl += '    </ul>';
            //tpl += '  </div>';
            //tpl += '</nav>';

            return _.template(tpl);
        },
        onInitialize: function () {
            var self = this;
            vent.on('user:login user:logout', self.onUserChange, self);
            self.onUserChange();
        },
        onLoginClick: function() {
            var self = this;
            self.goTo('login');
        },
        onRender: function () {
            var self = this;
            self.$el.find('li[data-id="menu"]').sidr({
                name: 'menu_main',
                side: 'left',
                source: function() { 
                    var menu = new Menu({ classStyle: 'sidebarstyle1' });
                    menu.on('menu:select', function() { $.sidr('close', 'menu_main'); });
                    return menu.render().el; }
            });
        },
        onUserChange: function() {
            var self = this;

            self.app.main.isAuthenticated(function(err, result) {
                self.app.store.refreshAll(function() {});
                if (result) {
                    self.$el.find('li[data-id="menu"]').removeClass('hidden').addClass('visible-xs');    
                    $('#menu').find('.menuview').removeClass('hidden');
                } else {
                    self.$el.find('li[data-id="menu"]').removeClass('visible-xs').addClass('hidden');
                    $('#menu').find('.menuview').addClass('hidden');
                }
            });
        }
    });
});