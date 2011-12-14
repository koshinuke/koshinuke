goog.provide('org.koshinuke.ui.TreeGrid.Node');
goog.provide('org.koshinuke.ui.TreeGrid.Node.State');
goog.provide('org.koshinuke.ui.TreeGrid.Leaf');
goog.provide('org.koshinuke.ui.TreeGrid.Psuedo');

goog.require('goog.dom.classes');
goog.require('goog.dom.query');

goog.require('goog.ui.Component');

goog.require('org.koshinuke.template.treegrid');

// TODO 汎用的に使える形に丸めるのは後で。
/** @constructor */
org.koshinuke.ui.TreeGrid.Node = function(opt_domHelper) {
	goog.ui.Component.call(this, opt_domHelper);
};
goog.inherits(org.koshinuke.ui.TreeGrid.Node, goog.ui.Component);

/** @constructor */
org.koshinuke.ui.TreeGrid.Leaf = function() {
	org.koshinuke.ui.TreeGrid.Node.call(this);
};
goog.inherits(org.koshinuke.ui.TreeGrid.Leaf, org.koshinuke.ui.TreeGrid.Node);

/** @constructor */
org.koshinuke.ui.TreeGrid.Psuedo = function(parentPath) {
	org.koshinuke.ui.TreeGrid.Leaf.call(this);
	this.path = parentPath + '/psuedo';
};
goog.inherits(org.koshinuke.ui.TreeGrid.Psuedo, org.koshinuke.ui.TreeGrid.Leaf);

/** @enum {string} */
org.koshinuke.ui.TreeGrid.Node.State = {
	EXPAND : "expand",
	COLLAPSE : "collapse"
};

org.koshinuke.ui.TreeGrid.Node.prototype.indent = 0;
org.koshinuke.ui.TreeGrid.Node.prototype.type = "tttyyypppeee";
org.koshinuke.ui.TreeGrid.Node.prototype.path = "aaa/bbb/ccc";
org.koshinuke.ui.TreeGrid.Node.prototype.level = 0;
org.koshinuke.ui.TreeGrid.Node.prototype.name = "nnn.nnn";
org.koshinuke.ui.TreeGrid.Node.prototype.visible = false;
org.koshinuke.ui.TreeGrid.Node.prototype.setVisible = function(state) {
	this.visible = state;
	var el = this.getElement();
	if(el) {
		goog.style.showElement(el, state);
	}
};

org.koshinuke.ui.TreeGrid.Node.prototype.state = org.koshinuke.ui.TreeGrid.Node.State.COLLAPSE;
org.koshinuke.ui.TreeGrid.Node.prototype.children = 0;
org.koshinuke.ui.TreeGrid.Node.prototype.hasChild = true;
org.koshinuke.ui.TreeGrid.Leaf.prototype.hasChild = false;
org.koshinuke.ui.TreeGrid.Node.prototype.isLoaded = false;
org.koshinuke.ui.TreeGrid.Node.prototype.loadedOffset = 0;

org.koshinuke.ui.TreeGrid.Node.prototype.icon = "folder";
org.koshinuke.ui.TreeGrid.Leaf.prototype.icon = "txt";
org.koshinuke.ui.TreeGrid.Node.prototype.timestamp = "YYYY-MM-DD hh:mm:ss";
org.koshinuke.ui.TreeGrid.Node.prototype.message = "mmeessaaggee";
org.koshinuke.ui.TreeGrid.Node.prototype.author = "aauutthhoorr";

/** @override */
org.koshinuke.ui.TreeGrid.Node.prototype.createDom = function() {
	this.internalCreateDom_(org.koshinuke.template.treegrid.row);
};
org.koshinuke.ui.TreeGrid.Node.prototype.internalCreateDom_ = function(tmpl) {
	this.emitIndent();
	var wrapper = this.getDomHelper().createElement('TBODY');
	wrapper.innerHTML = tmpl(this);
	this.decorateInternal(wrapper.firstChild);
};
/** @override */
org.koshinuke.ui.TreeGrid.Psuedo.prototype.createDom = function() {
	this.internalCreateDom_(org.koshinuke.template.treegrid.psuedo);
};
/** @override */
org.koshinuke.ui.TreeGrid.Node.prototype.enterDocument = function() {
	org.koshinuke.ui.TreeGrid.Node.superClass_.enterDocument.call(this);
	var el = this.getElement();
	if(el) {
		el.model = this;
	}
};
/** @override */
org.koshinuke.ui.TreeGrid.Node.prototype.exitDocument = function() {
	var el = this.getElement();
	if(el) {
		el.model = null;
	}
	org.koshinuke.ui.TreeGrid.Node.superClass_.exitDocument.call(this);
};
/** @protected */
org.koshinuke.ui.TreeGrid.Node.prototype.emitIndent = function() {
	this.indent = this.level * 18;
};
/** @override */
org.koshinuke.ui.TreeGrid.Leaf.prototype.emitIndent = function() {
	this.indent = (this.level + 1) * 18;
};
