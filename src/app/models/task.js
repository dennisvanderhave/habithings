define(['backbone', 'backbone-store'], function (Backbone, BBStore) {
    var model = Backbone.Model.extend({
        // fields: uuid*, name*, pluginId*, triggers, command
        //          triggers(field): type*, uuid*, trigger*
        //          command: type*, uuid*, name*, params
        //                  params: { param: field }
        idAttribute: 'uuid',
        initialize: function () {
            var store = new BBStore(this, 'tasks');
        }
    });
    return model;
});


//  "name":"Greater than",
//  "pluginId":"df007526-8741-11e3-baa7-0800200c9a66",
//  "uuid":"5626ee70-94aa-11e3-9082-0786ea0828ab",
//  "_id":"z2EdE8FonnMvB7lV",
//  "settings":{
//      "value2":5
//  },
//  "links":{
//      "value1":{
//          "type":"device",
//          "uuid":"f49c1360-94a9-11e3-96d3-118b4cc7a625",
//          "trigger":"temperature"
//      },
//      "value2":{
//          "type":"value"
//      }
//  },
//  "command":{
//      "type":"device",
//      "uuid":"f49c1360-94a9-11e3-96d3-118b4cc7a625",
//      "name":"setCity","params":{
//          "city":"Alkmaar"
//      }
//  }