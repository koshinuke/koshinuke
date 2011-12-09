goog.provide('org.koshinuke.ui.TreeGrid.Node');

goog.require('goog.dom.classes');
goog.require('goog.dom.query');

goog.require('goog.ui.Component');

goog.require('org.koshinuke.template.treegrid');

// TODO 汎用的に使える形に丸めるのは後で。
/** @constructor */
org.koshinuke.ui.TreeGrid.Node = function() {
	goog.ui.Component.call(this, opt_domHelper);
};
goog.inherits(org.koshinuke.ui.TreeGrid.Node, goog.ui.Component);

org.koshinuke.ui.TreeGrid.Node.prototype.indent = 0;
org.koshinuke.ui.TreeGrid.Node.prototype.setIndent = function(level) {
	this.indent = level * 18;
};
org.koshinuke.ui.TreeGrid.Node.prototype.state = "";
org.koshinuke.ui.TreeGrid.Node.prototype.icon = "xxx";
org.koshinuke.ui.TreeGrid.Node.prototype.path = "aaa/bbb/ccc";
org.koshinuke.ui.TreeGrid.Node.prototype.name = "nnn.nnn";
org.koshinuke.ui.TreeGrid.Node.prototype.timestamp = "YYYY-MM-DD hh:mm:ss";
org.koshinuke.ui.TreeGrid.Node.prototype.message = "mmm";
org.koshinuke.ui.TreeGrid.Node.prototype.auther = "aaa";


/** @override */
org.koshinuke.ui.TreeGrid.Node.prototype.createDom = function() {
	var el = goog.soy.renderAsElement(org.koshinuke.template.treegrid.row, this);
	return el;
};