goog.provide('org.koshinuke.ui.TreeGrid.Node');

goog.require('org.koshinuke.template.treegrid');

// TODO 汎用的に使える形に丸めるのは後で。
/** @constructor */
org.koshinuke.ui.TreeGrid.Node = function() {
};

org.koshinuke.ui.TreeGrid.Node.prototype.indent = 0;
org.koshinuke.ui.TreeGrid.Node.prototype.setIndent = function(level) {
	this.indent = level * 18;
};
org.koshinuke.ui.TreeGrid.Node.prototype.state = org.koshinuke.ui.TreeGrid.Node.State.COLLAPSE;
org.koshinuke.ui.TreeGrid.Node.prototype.icon = "xxx";
org.koshinuke.ui.TreeGrid.Node.prototype.name = "nnn nnn";
org.koshinuke.ui.TreeGrid.Node.prototype.timestamp = "YYYY-MM-DD hh:mm:ss";
org.koshinuke.ui.TreeGrid.Node.prototype.message = "mmm";
org.koshinuke.ui.TreeGrid.Node.prototype.auther = "aaa";

/** @enum {string} */
org.koshinuke.ui.TreeGrid.Node.State = {
	EXPAND : "expand",
	COLLAPSE : "collapse",
	EMPTY: "empty"
};

org.koshinuke.ui.TreeGrid.Node.prototype.toElement = function() {
	return goog.soy.renderAsElement(org.koshinuke.template.treegrid.row, this);
};
