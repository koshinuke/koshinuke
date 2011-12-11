goog.provide('org.koshinuke.ui.TreeGrid');
goog.provide('org.koshinuke.ui.TreeGrid.EventType');
goog.provide('org.koshinuke.ui.TreeGrid.NodeState');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events.Event');
goog.require('goog.soy');
goog.require('goog.style');

goog.require('goog.ui.Component');

goog.require('org.koshinuke');
goog.require('org.koshinuke.template.treegrid');

/** @constructor */
org.koshinuke.ui.TreeGrid = function(opt_domHelper) {
	goog.ui.Component.call(this, opt_domHelper);
	this.listenEvents_();
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
	COLLAPSE : "collapse"
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
			var et = org.koshinuke.ui.TreeGrid.EventType;
			var ns = org.koshinuke.ui.TreeGrid.NodeState;
			if(goog.array.contains(ary, ns.EXPAND)) {
				this.fire_(e.target, et.BEFORE_COLLAPSE, et.COLLAPSE, ary[0], ns.COLLAPSE)
			} else if(goog.array.contains(ary, ns.COLLAPSE)) {
				this.fire_(e.target, et.BEFORE_EXPAND, et.EXPAND, ary[0], ns.EXPAND)
			}
		}
	}, false, this);
};
/** @private */
org.koshinuke.ui.TreeGrid.prototype.fire_ = function(target, beforeType, afterType, current, next) {
	var el = org.koshinuke.findParent(target, 'TR');
	if(!this.dispatchEvent({
		type : beforeType,
		rowEl : el
	})) {
		return;
	}
	this.setState_(target, current, next);
	this.dispatchEvent({
		type : afterType,
		rowEl : el
	});
};
/** @private */
org.koshinuke.ui.TreeGrid.prototype.setState_ = function(el, current, next) {
	goog.dom.classes.addRemove(el, current, next);
};
/** @private */
org.koshinuke.ui.TreeGrid.prototype.listenEvents_ = function() {
	var h = this.getHandler();
	h.listen(this, org.koshinuke.ui.TreeGrid.EventType.BEFORE_COLLAPSE, this.handleBeforeCollapse_);
	h.listen(this, org.koshinuke.ui.TreeGrid.EventType.BEFORE_EXPAND, this.handleBeforeExpand_);
};
/** @private */
org.koshinuke.ui.TreeGrid.prototype.handleBeforeCollapse_ = function(e) {
	this.switchChildNodes_(e.rowEl, function(el, mine, yours) {
		var pl = yours.length;
		if(0 < pl && mine.length < pl) {
			goog.array.forEach(goog.dom.query('.expand', el), function(a) {
				var ary = goog.dom.classes.get(a);
				var et = org.koshinuke.ui.TreeGrid.EventType;
				this.fire_(a, et.BEFORE_COLLAPSE, et.COLLAPSE, ary[0], org.koshinuke.ui.TreeGrid.NodeState.COLLAPSE);
			}, this);
			goog.style.showElement(el, false);
			return false;
		}
		return true;
	});
	return true;
};
/** @private */
org.koshinuke.ui.TreeGrid.prototype.getPath_ = function(el) {
	var s = el.getAttribute('path');
	if(s) {
		return s.split('/');
	}
	return [];
};
/** @private */
org.koshinuke.ui.TreeGrid.prototype.handleBeforeExpand_ = function(e) {
	this.switchChildNodes_(e.rowEl, function(el, mine, yours) {
		var ml = mine.length;
		var yl = yours.length;
		if(ml + 1 == yl) {
			goog.style.showElement(el, true);
			return false;
		} else if(ml == yl && el.model) {
			var c = el.model.children;
			if(c && goog.isNumber(c) && 0 < c) {
				// TODO psuedoNodeを作ってaddChild
				// TODO el.model.loader() を 非同期処理キューに入れる。
				return true;
			}
		}
		return true;
	});
};
/** @private */
org.koshinuke.ui.TreeGrid.prototype.switchChildNodes_ = function(re, fn) {
	var myPath = this.getPath_(re);
	var next;
	do {
		next = goog.dom.getNextElementSibling(re);
		if(next) {
			var path = this.getPath_(next);
			if(fn.call(this, next, myPath, path)) {
				break;
			}
			re = next;
		}
	} while(next);
	return true;
};
/** @override */
org.koshinuke.ui.TreeGrid.prototype.setModel = function(model) {
	org.koshinuke.ui.TreeGrid.superClass_.setModel.call(this, model);
	var el = this.getElement();
	var tbody = goog.dom.query("tbody", el)[0];
	goog.dom.removeChildren(tbody);

	goog.soy.renderElement(tbody, org.koshinuke.template.treegrid.tmpl, {
		list : model
	});
};
/** @private */
org.koshinuke.ui.TreeGrid.prototype.sortModel_ = function(rows) {
	return goog.array.sort(rows, function(left, right) {
		return goog.array.defaultCompare(left.path, right.path);
	});
};
/** @return {Array} */
org.koshinuke.ui.TreeGrid.prototype.loadRow = function(parent) {
	return this.loaderfn(parent);
};
/** @override */
org.koshinuke.ui.TreeGrid.prototype.disposeInternal = function() {
	org.koshinuke.ui.TreeGrid.superClass_.disposeInternal.call(this);
};
