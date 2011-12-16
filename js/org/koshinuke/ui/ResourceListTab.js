goog.provide('org.koshinuke.ui.ResourceListTab');
goog.provide('org.koshinuke.ui.BranchListTab');
goog.provide('org.koshinuke.ui.TagListTab');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.query');
goog.require('goog.events');

goog.require('goog.ui.Tab');

goog.require('org.koshinuke.ui.TreeGrid');
goog.require('org.koshinuke.ui.BranchLoader');
goog.require('org.koshinuke.ui.TagLoader');

/** @constructor */
org.koshinuke.ui.ResourceListTab = function(parent, content, opt_renderer, opt_domHelper) {
	goog.ui.Tab.call(this, content, opt_renderer, opt_domHelper);
	this.parentEl = goog.dom.getElement(parent);
	this.pane = null;
};
goog.inherits(org.koshinuke.ui.ResourceListTab, goog.ui.Tab);

org.koshinuke.ui.ResourceListTab.prototype.loadPane = goog.abstractMethod;

/** @constructor */
org.koshinuke.ui.BranchListTab = function(parent, content, opt_renderer, opt_domHelper) {
	org.koshinuke.ui.ResourceListTab.call(this, parent, content, opt_renderer, opt_domHelper);
};
goog.inherits(org.koshinuke.ui.BranchListTab, org.koshinuke.ui.ResourceListTab);

/** @override */
org.koshinuke.ui.BranchListTab.prototype.loadPane = function(uri) {
	var loader = new org.koshinuke.ui.BranchLoader(uri);
	this.internalLoadPane_(loader, this.getModel().branches);
};
/** @private */
org.koshinuke.ui.ResourceListTab.prototype.internalLoadPane_ = function(loader,models) {
	this.pane = new org.koshinuke.ui.TreeGrid(loader);
	goog.array.forEach(models, function(a) {
		this.pane.addChild(a, true);
	}, this);
};
/** @constructor */
org.koshinuke.ui.TagListTab = function(parent, content, opt_renderer, opt_domHelper) {
	org.koshinuke.ui.ResourceListTab.call(this, parent, content, opt_renderer, opt_domHelper);
};
goog.inherits(org.koshinuke.ui.TagListTab, org.koshinuke.ui.ResourceListTab);

/** @override */
org.koshinuke.ui.TagListTab.prototype.loadPane = function(uri) {
	var loader = new org.koshinuke.ui.TagLoader(uri);
	this.internalLoadPane_(loader, this.getModel().tags);
};
/** @override */
org.koshinuke.ui.ResourceListTab.prototype.enterDocument = function() {
	org.koshinuke.ui.ResourceListTab.superClass_.enterDocument.call(this);
	if(this.pane) {
		this.pane.render(this.parentEl);
	}
	this.listenEvents_();
};
/** @private */
org.koshinuke.ui.ResourceListTab.prototype.listenEvents_ = function() {
	var h = this.getHandler();
	h.listen(this, goog.ui.Component.EventType.SELECT, this.handleSelect);
	h.listen(this, goog.ui.Component.EventType.UNSELECT, this.handleUnSelect);
};
org.koshinuke.ui.ResourceListTab.prototype.handleSelect = function(e) {
	if(this.pane) {
		this.pane.setVisible(true);
	};
};
org.koshinuke.ui.ResourceListTab.prototype.handleUnSelect = function(e) {
	if(this.pane) {
		this.pane.setVisible(false);
	};
};
/** @override */
org.koshinuke.ui.ResourceListTab.prototype.exitDocument = function() {
	org.koshinuke.ui.ResourceListTab.superClass_.exitDocument.call(this);
	if(this.pane) {
		this.pane.exitDocument();
	}
};
/** @override */
org.koshinuke.ui.Repository.prototype.disposeInternal = function() {
	org.koshinuke.ui.ResourceListTab.superClass_.disposeInternal.call(this);
	if(this.pane) {
		this.pane.dispose();
	}
	this.pane = null;
};
