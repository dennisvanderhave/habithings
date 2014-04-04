 define(['jquery', 'underscore', 'backbone', 'views/baseview'], function ($, _, Backbone, BaseView) {
    return BaseView.extend({
        className: 'dialogview',
        events: {
            'click [data-action]': 'onAction'
        },
        template: function () {
            var self = this;
            var tpl = '';

            var actions = [];
            _.each(_.keys(self.options.actions), function(key) {
                var action = self.options.actions[key];
                if (action.label && action.action && action.visible) { actions.push(action); }
            });

            tpl += '<div class="modal fade" tabindex="-1" role="dialog" data-backdrop="static" aria-hidden="true">';
            tpl += '  <div class="modal-dialog">';
            tpl += '    <div class="modal-content">';
            if (self.options.title) {
                tpl += '  <div class="modal-header">';
                tpl += '    <button type="button" data-action="cancel" class="close">&times;</button>';
                tpl += '    <span>' + self.options.title + '</span>';
                tpl += '  </div>';
            }
            tpl += '      <div class="modal-body"></div>';
            if (actions.length > 0) {
                tpl += '  <div class="modal-footer">';
                _.each(actions, function(item) {
                    var style = (item.label == actions[0].label) ? 'btn-primary' : 'btn-default';
                    tpl += '<button data-action="' + item.action + '" type="button" class="btn btn-lg ' + style + '">' + item.label + '</button>';
                });
                tpl += '  </div>';
            }
            tpl += '    </div>';
            tpl += '  </div>';
            tpl += '</div>';

            return tpl;
        },
        onInitialize: function () {
            var self = this;
            self.options.actions = self.options.actions || {};
            self.options.actions.ok = self.options.actions.ok || {}
            self.options.actions.cancel = self.options.actions.cancel || {}
            self.options.actions.ok = _.defaults(self.options.actions.ok, { label: 'Ok', action: 'ok', visible: false });
            self.options.actions.cancel = _.defaults(self.options.actions.cancel, { label: 'Cancel', action: 'cancel', visible: false });
        },
        onAction: function (e) {
            var self = this;
            var action = e.currentTarget.dataset.action;
            self.trigger('dialog:' + action);
        },
        onClose: function () {
            var self = this;
            self.$el.find('div.modal').modal('hide');
            $('div.modal-backdrop').remove();
        },
        onRender: function () {
            var self = this;
            
            self.$el.find('div.modal-body').html(self.options.view.render().el);
            self.$el.find('div.modal').modal('show');

            //self.options.contentView.on('dialog:ok', function (args) {
            //    self.trigger('dialog:ok', args);
            //});
            //self.options.contentView.on('dialog:cancel', function (args) {
            //    self.trigger('dialog:cancel', args);
            //});

            //self.ui.dialog.modal('show');

        }
    });
});