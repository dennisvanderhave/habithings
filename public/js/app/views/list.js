define(['backbone', 'underscore', 'iscroll', 'views/baseview'], function (Backbone, _, iScroll, BaseView) {
    return BaseView.extend({
        _displayCount: 0,
        _scroll: null,
        _getEmptyRendered: function () {
            var self = this;
            var tpl = '';
            tpl += '<div class="listitem-default container-full">';
            tpl += '  <div class="row">';
            tpl += '    <div class="col-xs-12">No Items</div>';
            tpl += '  </div>';
            tpl += '</div>';
            if (self.options.onEmptyRender) {
                tpl = self.options.onEmptyRender();
            }
            return '<li data-empty="empty" class="border-box">' + tpl + '</li>';
        },
        _getItemRendered: function (model, replace) {
            var self = this;
            
            var tplItem = (self.options.onItemRender) ? self.options.onItemRender(model) : '';
            var tplOptions = (self.options.onItemOptionsRender) ? self.options.onItemOptionsRender(model) : '';
            var dataOptions = (tplOptions) ? ' data-options="hide"' : '';

            var tpl = '';
            tpl += (!replace) ? '<li data-cid="' + model.cid + '"' + dataOptions + ' class="border-box">' : '';
            tpl += (tplItem) ? '<div data-layer="main" class="trans-200">' + tplItem + '</div>' : '';
            tpl += (tplOptions) ? '<div data-layer="options">' + tplOptions + '</div>' : '';
            tpl += (!replace) ? '</li>' : '';
            return tpl;
        },
        _getLessRendered: function () {
            var self = this;
            var tpl = '';
            tpl += '<div class="listitem-default row">';
            tpl += '  <div class="col-xs-12">Less</div>';
            tpl += '</div>';
            if (self.options.onLessRender) {
                tpl = self.options.onLessRender();
            }
            return '<li data-less="less" class="border-box">' + tpl + '</li>';
        },
        _getMoreRendered: function () {
            var self = this;
            var moreCount = self.collection.length - self._displayCount;
            var tpl = '';
            tpl += '<div class="listitem-default row">';
            tpl += '  <div class="col-xs-12">More (' + moreCount + ')' + '</div>';
            tpl += '</div>';
            if (self.options.onMoreRender) {
                tpl = self.options.onMoreRender();
            }
            return '<li data-more="more" class="border-box">' + tpl + '</li>';
        },
        _listItemsSorter: function (li_a, li_b) {
            var self = this;

            var cidA = li_a.e.attr('data-cid');
            var cidB = li_b.e.attr('data-cid');

            var modelA = self.collection.get(cidA);
            var modelB = self.collection.get(cidB);

            var indexA = self.collection.indexOf(modelA);
            var indexB = self.collection.indexOf(modelB);

            if (indexA < indexB) {
                return -1;
            } else if (indexA > indexB) {
                return 1;
            } else {
                return 0;
            }
        },
        _scrollRefresh: function () {
            var self = this;

            setTimeout(function () {
                if (!self._scroll) {
                    var el = self.ui.listcontent[0];
                    if (el) {
                        var options = { scrollbars: true };
                        options = _.extend(options, { click: false, tap: true });
                        self._scroll = new iScroll(el, options);
                    }
                } else {
                    self._scroll.refresh();
                }
            }, 0);
        },
        className: 'listview border-box',
        ui: {
            listcontent: 'div.listcontent',
            listitems: 'ul:first'
        },
        events: {
            'tap li[data-cid]': 'onItemClick',
            'blur li[data-cid] *': 'onItemEvent',
            'tap li[data-cid] *': 'onItemEvent',
            'tap li[data-less]': 'onLessClick',
            'tap li[data-more]': 'onMoreClick'
        },
        collectionEvents: {
            'add': 'onModelAdd',
            'change': 'onModelChange',
            'destroy': 'onModelRemove',
            'remove': 'onModelRemove',
            'reset': 'onCollectionReset',
            'sort': 'onCollectionSort'
        },
        modelEvents: {},
        template: function () {
            var self = this;

            var tpl = '';
            tpl += '<div class="listcontent">';
            tpl += '  <div class="listitems">';
            tpl += '    <ul>';
            tpl += '    </ul>';
            tpl += '  </div>';
            tpl += '</div>';
            return _.template(tpl);
        },
        onInitialize: function () {
            var self = this;
            self.bindAll(self);
            self._displayCount = 0;
            self._top = self.options.top || 0;
            self._displayCountStep = self.options.top || 10;
            //self._scope = self.options.scope || self;
        },
        onCollectionReset: function () {
            var self = this;
            self.updateItems();
        },
        onCollectionSort: function () {
            var self = this;
            self.updateItems();
        },
        onItemClick: function (e) {
            var self = this;
            var cid = e.currentTarget.dataset.cid;
            var model = self.collection.get(cid);
            if (self.options.onItemSelect) {
                //self.options.onItemSelect.apply(self._scope, [model, e.target, e.type]);
                self.options.onItemSelect(model, e.target, e.type);
            }
        },
        onItemOptions: function (e) {
            var self = this;
            var currTarget = e.currentTarget;
            var allItems = self.$el.find('li[data-options]');
            var currItem = self.$el.find(currTarget);

            if (e.type == 'swipeleft') {
                allItems.attr('data-options', 'hide');
                currItem.attr('data-options', 'show');
            } else if (e.type == 'swiperight') {
                currItem.attr('data-options', 'hide');
            }
        },
        onItemEvent: function (e) {
            var self = this;
            var currTarget = e.currentTarget;
            if (currTarget && e.type && self.options.onItemEvent) {
                var listItems = self.$el.find(currTarget).closest('li');
                if (listItems.length > 0) {
                    var listItem = listItems[0];
                    var cid = listItem.dataset.cid;
                    if (cid) {
                        var model = self.collection.get(cid);
                        //if (model) { self.options.onItemEvent.apply(self._scope, [model, currTarget, e.type]); }
                        if (model) { self.options.onItemEvent(model, currTarget, e.type); }
                    }
                }
            }
        },
        onLessClick: function (e) {
            var self = this;
            self.updateItems('less');
        },
        onListChange: function () {
            var self = this;
            if (self.options.onListChange) {
                tpl = self.options.onListChange();
            }
            //self.$el.find('li[data-cid]').hammer().on('dragleft dragright', self.onItemDrag);

            self.$el.find('li[data-options]').hammer({ tap: false }).on('swipeleft swiperight', self.onItemOptions);
            
            self._scrollRefresh();
        },
        onModelAdd: function (model, collection, options) {
            var self = this;
            self.updateItems('add', model);
        },
        onModelChange: function (model) {
            var self = this;
            self.updateItems('change', model);
        },
        onModelRemove: function (model) {
            var self = this;
            self.updateItems('remove', model);
        },
        onMoreClick: function (e) {
            var self = this;
            self.updateItems('more');
        },
        onRender: function () {
            var self = this;
            if (self.options.classStyle) { self.$el.addClass(self.options.classStyle); }
            self.updateItems();
        },
        scrollRefresh: function () {
            var self = this;
            self._scrollRefresh();
        },
        scrollTo: function (model) {
            var self = this;
            setTimeout(function () {
                if (self._scroll) {
                    var itemModel = self.$el.find('li[data-cid="' + model.cid + '"]', self.ui.listitems);
                    if (itemModel.length > 0) {
                        self._scroll.scrollToElement(itemModel[0], 300);
                    }
                }
            }, 0);
        },
        updateItems: function (action, model) {
            var self = this;

            // display count
            if (action == 'less' || action == 'add' || action == 'change' || action == 'remove') {
                self._displayCount = Math.min(self._displayCountStep, self.collection.length);
            } else if (action == 'more') {
                self._displayCount = self.collection.length;
            }
            self._displayCount = (self._displayCount < self._displayCountStep) ? Math.min(self._displayCountStep, self.collection.length) : self._displayCount;
            self._displayCount = Math.min(self._displayCount, self.collection.length);
            var displayCount = (self._top) ? self._displayCount : self.collection.length;
            var displayItems = new Backbone.Collection(self.collection.first(displayCount));

            // remove items
            var screenItems = self.$el.find('li[data-cid]', self.ui.listitems).map(function () { return $(this)[0].dataset.cid; });
            for (var i = 0; i < screenItems.length; i++) {
                var cid = screenItems[i];
                var colItem = displayItems.get(cid);
                if (!colItem) {
                    self.$el.find('li[data-cid="' + cid + '"]', self.ui.listitems).remove();
                }
            }
            // add items
            var screenItems = self.$el.find('li[data-cid]', self.ui.listitems).map(function () { return $(this)[0].dataset.cid; });
            for (var i = 0; i < displayCount; i++) {
                var displayItem = displayItems.models[i];
                if (_.indexOf(screenItems, displayItem.cid) < 0) {
                    var item = self._getItemRendered(displayItem);
                    self.ui.listitems.append(item);
                    if (self.options.onItemAfterRender) {
                        var el = self.$el.find('li[data-cid="' + displayItem.cid + '"]');
                        self.options.onItemAfterRender(displayItem, el);
                    }
                }
            }
            // change item
            if (action == 'change' && model) {
                var screenItems = self.$el.find('li[data-cid]', self.ui.listitems).map(function () { return $(this)[0].dataset.cid; });
                if (_.indexOf(screenItems, model.cid) >= 0) {
                    var item = self._getItemRendered(model, true);
                    if (item) {
                        //self.$el.find('li[data-cid="' + model.cid + '"]', self.ui.listitems).replaceWith(item);
                        self.$el.find('li[data-cid="' + model.cid + '"]').html(item);
                        if (self.options.onItemAfterRender) {
                            var el = self.$el.find('li[data-cid="' + displayItem.cid + '"]');
                            self.options.onItemAfterRender(displayItem, el);
                        }
                    }
                }
            }
            // sort
            // self.$el.find('li', self.ui.listitems).tsort('', { sortFunction: self._listItemsSorter });
            // empty item
            var sel = 'li[data-empty="empty"]';
            var hasEmpty = (self.$el.find(sel, self.ui.listitems).length > 0);
            var needEmpty = (!displayCount);
            if (hasEmpty) {
                self.$el.find(sel, self.ui.listitems).remove();
            }
            if (needEmpty) {
                self.ui.listitems.append(self._getEmptyRendered());
            }
            // more item
            var sel = 'li[data-more="more"]';
            var hasMore = (self.$el.find(sel, self.ui.listitems).length > 0);
            var needMore = (self._top && self._displayCount < self.collection.length);
            if (hasMore) {
                self.$el.find(sel, self.ui.listitems).remove();
            }
            if (needMore) {
                self.ui.listitems.append(self._getMoreRendered());
            }
            // less item
            var sel = 'li[data-less="less"]';
            var screenItems = self.$el.find('li[data-cid]', self.ui.listitems).map(function () { return $(this)[0].dataset.cid; });
            var hasLess = (self.$el.find(sel, self.ui.listitems).length > 0);
            var needLess = ((self._top) && (screenItems.length >= self.collection.length) && (self.collection.length > self._displayCountStep));
            if (hasLess) {
                self.$el.find(sel, self.ui.listitems).remove();
            }
            if (needLess) {
                self.ui.listitems.append(self._getLessRendered());
            }

            // triggers
            self.onListChange();

            // scroll to
            if (self.options.scrollTo && (action == 'add' || action == 'change') && model) {
                if (self.collection.length > 10) {
                    self.scrollTo(model);
                }
            }

        }
    });
});
