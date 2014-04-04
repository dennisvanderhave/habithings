define(['backbone', 'backbone-store', 'underscore'], function (Backbone, BBStore, _) {
    var model = Backbone.Model.extend({
        // fields: uuid*, code*, srcType*, srcId*, destType*, destId*, enabled
	    //    code (view / execute / edit / admin).... CRUD???
        //	  srcType (user / group)
	    //    srcId (uuid)
	    //    destType (system / device / task / area)
	    //    destId (uuid)
        idAttribute: 'uuid',
        initialize: function () {
            var store = new BBStore(this, 'permissions');
        },
        hasCode: function(code) {
            var self = this;
            var codeOrder = ['view', 'execute', 'edit', 'admin'];
            var codeSelf = self.get('code') || '';
            var idxSelf = _.indexOf(codeOrder, codeSelf);
            var idxCode = _.indexOf(codeOrder, code);
            if (idxSelf >= 0 && idxCode >= 0 && idxCode <= idxSelf) {
                return true;
                
            } else {
                return false;
            }
        }
    });
    return model;
});
