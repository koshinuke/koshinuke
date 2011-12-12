goog.provide('org.koshinuke.ui.TreeGrid.Node');
goog.provide('org.koshinuke.ui.TreeGrid.Leaf');

goog.require('goog.dom.classes');
goog.require('goog.dom.query');

goog.require('goog.ui.Component');

goog.require('org.koshinuke.template.treegrid');

// TODO 汎用的に使える形に丸めるのは後で。
/**
 * @param fn Function to call when the loading child. this function takes an argument.(function to remove psuedo node)
 * @constructor
 * */
org.koshinuke.ui.TreeGrid.Node = function(fn, opt_domHelper) {
	goog.ui.Component.call(this, opt_domHelper);
	this.loader = fn ? fn : goog.nullFunction;
};
goog.inherits(org.koshinuke.ui.TreeGrid.Node, goog.ui.Component);

/** @constructor */
org.koshinuke.ui.TreeGrid.Leaf = function() {
	org.koshinuke.ui.TreeGrid.Node.call(this);
};
goog.inherits(org.koshinuke.ui.TreeGrid.Leaf, org.koshinuke.ui.TreeGrid.Node);

org.koshinuke.ui.TreeGrid.Node.prototype.indent = 0;
org.koshinuke.ui.TreeGrid.Node.prototype.path = "aaa/bbb/ccc";
org.koshinuke.ui.TreeGrid.Node.prototype.name = "nnn.nnn";
org.koshinuke.ui.TreeGrid.Node.prototype.hasChild = true;
org.koshinuke.ui.TreeGrid.Leaf.prototype.hasChild = false;
org.koshinuke.ui.TreeGrid.Node.prototype.isLoaded = false;

org.koshinuke.ui.TreeGrid.Node.prototype.icon = "folder";
org.koshinuke.ui.TreeGrid.Leaf.prototype.icon = "resource";
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
org.koshinuke.ui.TreeGrid.Node.prototype.loadChild = function() {
	var psuedo = this.appendPsuedoEl();
	var self = this;
	var parent = this.getParent();
	this.loader(function(models) {
		goog.dom.removeNode(psuedo);
		if(goog.isArrayLike(models)) {
			var index = parent.indexOfChild(self) + 1;
			goog.array.forEach(models, function(a, i) {
				parent.addChildAt(a, index + i, true);
			});
		}
		self.isLoaded = true;
	});
};
org.koshinuke.ui.TreeGrid.Node.prototype.appendPsuedoEl = function() {
	var psuedoPath = this.path + '/psuedo';
	var ary = psuedoPath.split('/');
	var wrapper = this.getDomHelper().createElement('TBODY');
	wrapper.innerHTML = org.koshinuke.template.treegrid.psuedo({
		path : psuedoPath,
		indent : ary.length * 18
	});
	var el = wrapper.firstChild;
	goog.dom.insertSiblingAfter(el, this.getElement());
	return el;
};
