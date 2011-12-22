goog.provide('org.koshinuke.ui.PaneTab');
goog.provide('org.koshinuke.ui.BranchListTab');
goog.provide('org.koshinuke.ui.TagListTab');
goog.provide('org.koshinuke.ui.ResourceTab');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.dom.query');
goog.require('goog.events');

goog.require('goog.ui.Tab');

goog.require('org.koshinuke.ui.TreeGrid');
goog.require('org.koshinuke.ui.BranchLoader');
goog.require('org.koshinuke.ui.TagLoader');
goog.require('org.koshinuke.ui.ResourceLoader');
goog.require('org.koshinuke.ui.CodeMirrorWrapper');


/** @constructor */
org.koshinuke.ui.PaneTab = function(parent, content, opt_renderer, opt_domHelper) {
	goog.ui.Tab.call(this, content, opt_renderer, opt_domHelper);
	this.parentEl = goog.dom.getElement(parent);
	this.pane = null;
};
goog.inherits(org.koshinuke.ui.PaneTab, goog.ui.Tab);

org.koshinuke.ui.PaneTab.prototype.loadPane = goog.abstractMethod;

/** @constructor */
org.koshinuke.ui.BranchListTab = function(parent, content, opt_renderer, opt_domHelper) {
	org.koshinuke.ui.PaneTab.call(this, parent, content, opt_renderer, opt_domHelper);
};
goog.inherits(org.koshinuke.ui.BranchListTab, org.koshinuke.ui.PaneTab);
/** @override */
org.koshinuke.ui.BranchListTab.prototype.loadPane = function(uri) {
	var loader = new org.koshinuke.ui.BranchLoader(uri);
	this.internalLoadPane_(loader, this.getModel(), this.getModel().branches);
};
/** @override */
org.koshinuke.ui.BranchListTab.prototype.enterDocument = function() {
	org.koshinuke.ui.TagListTab.superClass_.enterDocument.call(this);
	goog.dom.classes.add(this.getElement(), org.koshinuke.findIcon(this.getModel().context));
};

/** @constructor */
org.koshinuke.ui.TagListTab = function(parent, content, opt_renderer, opt_domHelper) {
	org.koshinuke.ui.PaneTab.call(this, parent, content, opt_renderer, opt_domHelper);
};
goog.inherits(org.koshinuke.ui.TagListTab, org.koshinuke.ui.PaneTab);
/** @override */
org.koshinuke.ui.TagListTab.prototype.loadPane = function(uri) {
	var loader = new org.koshinuke.ui.TagLoader(uri);
	this.internalLoadPane_(loader, this.getModel(), this.getModel().tags);
};
/** @override */
org.koshinuke.ui.TagListTab.prototype.enterDocument = function() {
	org.koshinuke.ui.TagListTab.superClass_.enterDocument.call(this);
	goog.dom.classes.add(this.getElement(), org.koshinuke.findIcon(this.getModel().context));
};

/** @constructor */
org.koshinuke.ui.ResourceTab = function(parent, content, opt_renderer, opt_domHelper) {
	org.koshinuke.ui.PaneTab.call(this, parent, content, opt_renderer, opt_domHelper);
};
goog.inherits(org.koshinuke.ui.ResourceTab, org.koshinuke.ui.PaneTab);
/** @override */
org.koshinuke.ui.ResourceTab.prototype.loadPane = function(uri) {
	var loader = new org.koshinuke.ui.ResourceLoader(uri);
	this.pane = new org.koshinuke.ui.CodeMirrorWrapper(loader);
	this.pane.setModel(this.getModel().node);
};
/** @override */
org.koshinuke.ui.ResourceTab.prototype.enterDocument = function() {
	org.koshinuke.ui.ResourceTab.superClass_.enterDocument.call(this);
	var extension = org.koshinuke.getExtension(this.getModel().node.path);
	goog.dom.classes.add(this.getElement(), org.koshinuke.findIcon(extension));
};

/** @protected */
org.koshinuke.ui.PaneTab.prototype.internalLoadPane_ = function(loader, model, models) {
	this.pane = new org.koshinuke.ui.TreeGrid(loader);
	this.pane.setModel(model);
	goog.array.forEach(models, function(a) {
		this.pane.addChild(a, true);
	}, this);
};
/** @override */
org.koshinuke.ui.PaneTab.prototype.enterDocument = function() {
	org.koshinuke.ui.PaneTab.superClass_.enterDocument.call(this);
	if(this.pane) {
		this.pane.render(this.parentEl);
	}
	this.listenEvents_();
};
/** @private */
org.koshinuke.ui.PaneTab.prototype.listenEvents_ = function() {
	var h = this.getHandler();
	h.listen(this, goog.ui.Component.EventType.SELECT, this.handleSelect);
	h.listen(this, goog.ui.Component.EventType.UNSELECT, this.handleUnSelect);
};
org.koshinuke.ui.PaneTab.prototype.handleSelect = function(e) {
	if(this.pane) {
		this.pane.setVisible(true);
	};
};
org.koshinuke.ui.PaneTab.prototype.handleUnSelect = function(e) {
	if(this.pane) {
		this.pane.setVisible(false);
	};
};
/** @override */
org.koshinuke.ui.PaneTab.prototype.exitDocument = function() {
	org.koshinuke.ui.PaneTab.superClass_.exitDocument.call(this);
	if(this.pane) {
		this.pane.dispose();
	}
};
/** @override */
org.koshinuke.ui.PaneTab.prototype.disposeInternal = function() {
	org.koshinuke.ui.PaneTab.superClass_.disposeInternal.call(this);
	this.pane = null;
};
