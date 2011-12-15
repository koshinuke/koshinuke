goog.provide('org.koshinuke.ui.Repository');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.query');

goog.require('goog.ui.Tab');

goog.require('org.koshinuke.ui.RepositoryRenderer');

/** @constructor */
org.koshinuke.ui.Repository = function(content, opt_renderer, opt_domHelper) {
	goog.ui.Tab.call(this, content, opt_renderer || org.koshinuke.ui.RepositoryRenderer.getInstance(), opt_domHelper);
	this.tabbar = new goog.ui.TabBar(goog.ui.TabBar.Location.START);
};
goog.inherits(org.koshinuke.ui.Repository, goog.ui.Tab);

org.koshinuke.ui.Repository.prototype.tabbar = false;
org.koshinuke.ui.Repository.prototype.host = "hhoosstt";
org.koshinuke.ui.Repository.prototype.path = "ppaatthh";
org.koshinuke.ui.Repository.prototype.name = "reponame";

org.koshinuke.ui.Repository.prototype.setJson = function(json) {
	this.host = json['host'];
	this.path = json['path'];
	this.name = json['name'];
};
org.koshinuke.ui.Repository.prototype.enterDocument = function() {
	org.koshinuke.ui.Repository.superClass_.enterDocument.call(this);
	var el = goog.dom.query('.repo-context', this.getElement())[0];
	this.tabbar.decorate(el);
	goog.array.forEach(goog.dom.query('div', el), function(a) {
		var t = new goog.ui.Tab();
		t.decorate(a);
		this.tabbar.addChild(t);
	}, this);
	this.tabbar.setSelectedTabIndex(0);
};
org.koshinuke.ui.Repository.prototype.exitDocument = function() {
	org.koshinuke.ui.Repository.superClass_.exitDocument.call(this);
};
org.koshinuke.ui.Repository.prototype.disposeInternal = function() {
	org.koshinuke.ui.Repository.superClass_.disposeInternal.call(this);
	this.tabbar.dispose();
	this.tabbar = null;
};