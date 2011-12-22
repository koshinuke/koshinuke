goog.provide('org.koshinuke.ui.PaneTabBar');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.query');

goog.require('goog.ui.TabBar');

goog.require('org.koshinuke');

/**
 * @constructor
 * @extends {goog.ui.TabBar}
 * */
org.koshinuke.ui.PaneTabBar = function(paneWrapper, uri, opt_location, opt_renderer, opt_domHelper) {
	goog.ui.TabBar.call(this, opt_location, opt_renderer, opt_domHelper);
	this.paneWrapper = paneWrapper;
	this.uri = uri;
	this.tabmap = {};
	this.listenEvents_();
	this.lastSelected = null;
};
goog.inherits(org.koshinuke.ui.PaneTabBar, goog.ui.TabBar);

org.koshinuke.ui.PaneTabBar.prototype.addTab = function(model) {
	var hash = this.hash(model);
	var tab = this.tabmap[hash];
	if(!tab) {
		tab = this.newPane(model);
		this.addChild(tab, true);
		this.tabmap[hash] = tab;
	}
	this.setSelectedTab(tab);
};
org.koshinuke.ui.PaneTabBar.prototype.newPane = function(model) {
	var ctx = model.context;
	var tab;
	if(goog.isFunction(ctx)) {
		tab = ctx(this.paneWrapper, model.name);
		tab.setModel(model);
		tab.loadPane(this.uri);
	} else {
		tab = new goog.ui.Tab(model.name);
		tab.setModel(model);
	}
	return tab;
};
/** @private */
org.koshinuke.ui.PaneTabBar.prototype.hash = function(model) {
	return org.koshinuke.hash(model.host, model.path, model.name, model.label);
};
/** @override */
org.koshinuke.ui.PaneTabBar.prototype.decorateInternal = function(element) {
	org.koshinuke.ui.PaneTabBar.superClass_.decorateInternal.call(this, element);
	goog.events.listen(element, goog.events.EventType.CLICK, function(e) {
		var t = e.target;
		if(goog.dom.classes.has(t, "close")) {
			var myTabEl = t.parentNode;
			var rmTab;
			var rmIndex = -1;
			this.forEachChild(function(c, i) {
				var el = c.getElement();
				if(myTabEl === el) {
					rmTab = c;
					rmIndex = i;
					var hash = this.hash(c.getModel());
					delete this.tabmap[hash];
				}
			}, this);
			var reSelect = this.lastSelected && this.lastSelected != rmTab ? this.lastSelected : null;
			if(-1 < rmIndex) {
				this.removeChildAt(rmIndex, true);
			}
			if(reSelect) {
				this.setSelectedTab(reSelect);
			}
		}
	}, false, this);
};
/** @private */
org.koshinuke.ui.PaneTabBar.prototype.listenEvents_ = function() {
	var h = this.getHandler();
	h.listen(this, goog.ui.Component.EventType.UNSELECT, this.handleUnSelect);
};
org.koshinuke.ui.PaneTabBar.prototype.handleUnSelect = function(e) {
	this.lastSelected = e.target;
};
/** @override */
org.koshinuke.ui.PaneTabBar.prototype.disposeInternal = function() {
	org.koshinuke.ui.PaneTabBar.superClass_.disposeInternal.call(this);
	this.paneWrapper = null;
	this.uri = null;
	this.lastSelected = null;
	this.tabmap = null;
};
