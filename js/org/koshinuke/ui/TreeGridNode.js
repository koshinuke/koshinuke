goog.provide('org.koshinuke.ui.TreeGrid.Node');
goog.provide('org.koshinuke.ui.TreeGrid.Leaf');

goog.require('goog.dom.classes');
goog.require('goog.dom.query');

goog.require('goog.ui.Component');

goog.require('org.koshinuke.template.treegrid');

// TODO 汎用的に使える形に丸めるのは後で。
/** @constructor */
org.koshinuke.ui.TreeGrid.Node = function(fn, opt_domHelper) {
	goog.ui.Component.call(this, opt_domHelper);
	this.loader = fn;
};
goog.inherits(org.koshinuke.ui.TreeGrid.Node, goog.ui.Component);

/** @constructor */
org.koshinuke.ui.TreeGrid.Leaf = function(fn) {
	org.koshinuke.ui.TreeGrid.Node.call(this, fn);
};
goog.inherits(org.koshinuke.ui.TreeGrid.Leaf, org.koshinuke.ui.TreeGrid.Node);

org.koshinuke.ui.TreeGrid.Node.prototype.indent = 0;
org.koshinuke.ui.TreeGrid.Node.prototype.path = "aaa/bbb/ccc";
org.koshinuke.ui.TreeGrid.Node.prototype.name = "nnn.nnn";
org.koshinuke.ui.TreeGrid.Node.prototype.children = 0;

org.koshinuke.ui.TreeGrid.Node.prototype.icon = "icon";
org.koshinuke.ui.TreeGrid.Node.prototype.timestamp = "YYYY-MM-DD hh:mm:ss";
org.koshinuke.ui.TreeGrid.Node.prototype.message = "mmeessaaggee";
org.koshinuke.ui.TreeGrid.Node.prototype.auther = "aauutthheerr";

/** @override */
org.koshinuke.ui.TreeGrid.Node.prototype.createDom = function() {
	this.emitIndent();
	var wrapper = this.getDomHelper().createElement('TBODY');
	wrapper.innerHTML = org.koshinuke.template.treegrid.row(this);
	this.decorateInternal(wrapper.firstChild);
};
/** @override */
org.koshinuke.ui.TreeGrid.Node.prototype.enterDocument = function() {
	org.koshinuke.ui.TreeGrid.Node.superClass_.enterDocument.call(this);
	var el = this.getElement();
	if(el){
		el.model = this;
	}
};
/** @override */
org.koshinuke.ui.TreeGrid.Node.prototype.exitDocument = function() {
	var el = this.getElement();
	if(el){
		el.model = null;
	}
	org.koshinuke.ui.TreeGrid.Node.superClass_.exitDocument.call(this);
};

/** @protected */
org.koshinuke.ui.TreeGrid.Node.prototype.emitIndent = function() {
	var ary = this.path.split('/');
	this.indent = (ary.length - 1) * 18;
};
/** @override */
org.koshinuke.ui.TreeGrid.Leaf.prototype.emitIndent = function() {
	var ary = this.path.split('/');
	this.indent = ary.length * 18;
};
/** @override */
org.koshinuke.ui.TreeGrid.Node.prototype.disposeInternal = function() {
	org.koshinuke.ui.TreeGrid.Node.superClass_.disposeInternal.call(this);
	this.loader = null;
};
