/*!
 * backbone.iobind
 * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 * https://github.com/logicalparadox/backbone.iobind
 */

(function(a){var b,c,d;typeof window=="undefined"||typeof require=="function"?(b=require("underscore"),c=require("backbone"),d=module.exports=c):(b=this._,c=this.Backbone,d=this),c.sync=function(a,d,e){var f=function(a){return!a||!a.url?null:b.isFunction(a.url)?a.url():a.url},g=f(d).split("/"),h=g[0]!==""?g[0]:g[1],i=b.extend({req:h+":"+a},e);i.data=d.toJSON()||{};var j=d.socket||window.socket||c.socket;j.emit(h+":"+a,i.data,function(a,b){a?e.error(a):e.success(b)})}})()