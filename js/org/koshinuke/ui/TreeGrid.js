goog.provide('org.koshinuke.ui.TreeGrid');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events.Event');
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

/** @enum {string} */
org.koshinuke.ui.TreeGrid.NodeState = {
	EXPAND : "expand",
	COLLAPSE : "collapse",
	EMPTY : "empty"
};

/** @override */
org.koshinuke.ui.TreeGrid.prototype.canDecorate = function(element) {
	return element.tagName == 'TABLE';
};
/** @override */
org.koshinuke.ui.TreeGrid.prototype.decorateInternal = function(element) {
	org.koshinuke.ui.TreeGrid.superClass_.decorateInternal.call(this, element);
	// TODO KeyEventとかTABキーのアレとかは、後で考える。Container辺りを継承した方が良いのかな？
	goog.events.listen(element, goog.events.EventType.CLICK, function(e) {
		var el = e.target;
		if(el.tagName == 'SPAN') {
			var ary = goog.dom.classes.get(el);
			var s = org.koshinuke.ui.TreeGrid.NodeState;
			var et = org.koshinuke.ui.TreeGrid.EventType;
			if(goog.array.contains(ary, s.EXPAND)) {
				this.fire_(e, et.BEFORE_COLLAPSE, et.COLLAPSE, ary[0], s.COLLAPSE)
			} else if(goog.array.contains(ary, s.COLLAPSE)) {
				this.fire_(e, et.BEFORE_EXPAND, et.EXPAND, ary[0], s.EXPAND)
			} else if(goog.array.contains(ary, s.EMPTY)) {
				// do nothing.
			} else {
				var txt = goog.dom.getTextContent(el);
				if(txt) {
					this.dispatchEvent(e);
				}
			}
		}
	}, false, this);
};
/** @private */
org.koshinuke.ui.TreeGrid.prototype.fire_ = function(event, beforeType, afterType, current, next) {
	var el = event.target;
	if(!this.dispatchEvent({
		type : beforeType,
		rowEl : el
	})) {
		return;
	}
	this.setState_(el, current, next);
	this.dispatchEvent({
		type : afterType,
		rowEl : el
	});
};
/** @private */
org.koshinuke.ui.TreeGrid.prototype.setState_ = function(el, current, next) {
	goog.dom.classes.addRemove(el, current, next);
};
/** @override */
org.koshinuke.ui.TreeGrid.prototype.setModel = function(model) {
	org.koshinuke.ui.TreeGrid.superClass_.setModel.call(this, model);
};
/** @private */
org.koshinuke.ui.TreeGrid.prototype.sortModel_ = function(rows) {
	return goog.array.sort(rows, function(left, right) {
		return goog.array.defaultCompare(left.path, right.path);
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
