goog.provide('org.koshinuke.ui.TreeGrid');

goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.soy');

goog.require('goog.ui.Component');

goog.require('org.koshinuke.template.treegrid');

org.koshinuke.ui.TreeGrid = function(opt_domHelper) {
	goog.ui.Component.call(this, opt_domHelper);
	this.rows = [];
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
};
/** @override */
org.koshinuke.ui.TreeGrid.prototype.setModel = function(model) {
	org.koshinuke.ui.TreeGrid.superClass_.setModel.call(this, model);
};
/** @private */
org.koshinuke.ui.TreeGrid.prototype.makeRow_ = function(rowmodel) {
	/*
	 indent : rowmodel.indent,
	 rowState : rowmodel.rowState,
	 icon : rowmodel.icon,
	 name : rowmodel.name,
	 timestamp : rowmodel.timestamp,
	 message : rowmodel.message,
	 auther : rowmodel.auther
	 */
	return goog.soy.renderAsElement(org.koshinuke.template.treegrid.row, rowmodel);
};
/** @override */
org.koshinuke.ui.TreeGrid.prototype.disposeInternal = function() {
	org.koshinuke.ui.TreeGrid.superClass_.disposeInternal.call(this);
	this.rows = null;
};
