goog.provide('org.koshinuke.ui.Repository');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.query');
goog.require('goog.events');

goog.require('goog.ui.Tab');

goog.require('org.koshinuke.ui.TreeGrid');
goog.require('org.koshinuke.ui.TreeGrid.Node');
goog.require('org.koshinuke.ui.PaneTab.Factory');
goog.require('org.koshinuke.ui.RepositoryRenderer');

/** @constructor */
org.koshinuke.ui.Repository = function(opt_renderer, opt_domHelper) {
	goog.ui.Tab.call(this, null, opt_renderer || org.koshinuke.ui.RepositoryRenderer.getInstance(), opt_domHelper);
	this.tabbar = new goog.ui.TabBar(goog.ui.TabBar.Location.START);
};
goog.inherits(org.koshinuke.ui.Repository, goog.ui.Tab);

/** @enum {string} */
org.koshinuke.ui.Repository.EventType = {
	REPO_CONTEXT_SELECTED : "r.c.s"
};

org.koshinuke.ui.Repository.prototype.tabbar = false;
org.koshinuke.ui.Repository.prototype.listenerKey = null;
org.koshinuke.ui.Repository.prototype.host = "";
org.koshinuke.ui.Repository.prototype.path = "";
org.koshinuke.ui.Repository.prototype.name = "";

org.koshinuke.ui.Repository.prototype.setJson = function(json) {
	this.host = json['host'];
	this.path = goog.string.urlDecode(json['path']);
	this.name = goog.string.urlDecode(json['name']);
	var f = function(rawJson, type) {
		var ary = [];
		if(rawJson) {
			goog.array.forEach(rawJson, function(a) {
				a['type'] = type;
				var n = org.koshinuke.ui.TreeGrid.Node.newFromJson(a);
				n.icon = type;
				n.visible = true;
				ary.push(n);
			});
		}
		return ary;
	}
	this.branches = f(json['branches'], "branch");
	this.tags = f(json['tags'], "tag");
};
/** @override */
org.koshinuke.ui.Repository.prototype.enterDocument = function() {
	org.koshinuke.ui.Repository.superClass_.enterDocument.call(this);
	var element = goog.dom.query('.repo-context', this.getElement())[0];
	this.tabbar.decorate(element);
	this.listenerKey = goog.events.listen(this.tabbar, goog.ui.Component.EventType.SELECT, function(e) {
		var el = e.target.getElement();
		var cls = goog.dom.classes.get(el);
		var ctx;
		if(goog.array.contains(cls, 'branches')) {
			ctx = org.koshinuke.ui.PaneTab.Factory.Branches;
		} else if(goog.array.contains(cls, 'tags')) {
			ctx = org.koshinuke.ui.PaneTab.Factory.Tags;
		} else if(goog.array.contains(cls, 'histories')) {
			ctx = org.koshinuke.ui.PaneTab.Factory.Histories;
		}
		this.dispatchEvent({
			type : org.koshinuke.ui.Repository.EventType.REPO_CONTEXT_SELECTED,
			context : ctx,
			label : goog.dom.getTextContent(el)
		});
	}, false, this);
};
/** @override */
org.koshinuke.ui.Repository.prototype.exitDocument = function() {
	org.koshinuke.ui.Repository.superClass_.exitDocument.call(this);
	goog.events.unlistenByKey(this.listenerKey);
};
/** @override */
org.koshinuke.ui.Repository.prototype.disposeInternal = function() {
	org.koshinuke.ui.Repository.superClass_.disposeInternal.call(this);
	this.tabbar.dispose();
	this.tabbar = null;
	this.listenerKey = null;
};
org.koshinuke.ui.Repository.prototype.getSelectedTab = function() {
	return this.tabbar.getSelectedTab();
};
org.koshinuke.ui.Repository.prototype.setSelectedTabIndex = function(index) {
	this.tabbar.setSelectedTabIndex(index);
};