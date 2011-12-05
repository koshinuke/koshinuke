goog.provide('org.koshinuke.ui.RepoTabBar');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.query');

goog.require('goog.ui.TabBar');

goog.require('org.koshinuke');

/** @constructor */
org.koshinuke.ui.RepoTabBar = function(opt_location, opt_renderer, opt_domHelper) {
	goog.ui.TabBar.call(this, opt_location, opt_renderer, opt_domHelper);
	this.tabmap = {};
}

goog.inherits(org.koshinuke.ui.RepoTabBar, goog.ui.TabBar);

org.koshinuke.ui.RepoTabBar.prototype.addTab = function(model) {
	var label = " " + model.name;
	var hash = org.koshinuke.hash(model.host, model.path, model.name, model.context);
	var tab = this.tabmap[hash];
	if(!tab) {
		tab = new goog.ui.Tab(label);
		tab.setModel(model);
		this.addChild(tab, true);
		this.tabmap[hash] = tab;
		var el = tab.getElement();
		goog.dom.classes.add(el, org.koshinuke.findIcon(model.context));
	}
	this.setSelectedTab(tab);
}