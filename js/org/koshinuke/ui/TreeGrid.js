goog.provide('org.koshinuke.ui.TreeGrid');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.soy');

goog.require('goog.ui.Component');

goog.require('org.koshinuke.template.treegrid');

/** @constructor */
org.koshinuke.ui.TreeGrid = function(loaderfn, opt_domHelper) {
	goog.ui.Component.call(this, opt_domHelper);
	this.loaderfn = loaderfn;
};
goog.inherits(org.koshinuke.ui.TreeGrid, goog.ui.Component);

/** @enum {string} */
org.koshinuke.ui.TreeGrid.EventType = {
	BEFORE_EXPAND : 'before' + goog.ui.Component.EventType.OPEN,
	EXPAND : goog.ui.Component.EventType.OPEN,
	BEFORE_COLLAPSE : 'before' + goog.ui.Component.EventType.CLOSE,
	COLLAPSE : goog.ui.Component.EventType.CLOSE
};

/** @override */
org.koshinuke.ui.TreeGrid.prototype.canDecorate = function(element) {
	return element.tagName == 'TABLE';
};
/** @override */
org.koshinuke.ui.TreeGrid.prototype.decorateInternal = function(element) {
	org.koshinuke.ui.TreeGrid.superClass_.decorateInternal.call(this, element);
	// TODO KeyEventとかTABキーのアレとかは、後で考える。Container辺りを継承した方が良いのかな？
};
/** @private */
org.koshinuke.ui.TreeGrid.prototype.handleExpand_ = function() {

};
/** @override */
org.koshinuke.ui.TreeGrid.prototype.setModel = function(model) {
	org.koshinuke.ui.TreeGrid.superClass_.setModel.call(this, model);
};
/** @private */
org.koshinuke.ui.TreeGrid.prototype.sortModel_ = function(rows) {
	return goog.array.sort(rows, function(left, right) {

	});
};
/**
 * @return {Array}
 */
org.koshinuke.ui.TreeGrid.prototype.loadRow = function(parent) {
	return this.loaderfn(parent);
};
/** @override */
org.koshinuke.ui.TreeGrid.prototype.disposeInternal = function() {
	org.koshinuke.ui.TreeGrid.superClass_.disposeInternal.call(this);
	this.loaderfn = null;
};
