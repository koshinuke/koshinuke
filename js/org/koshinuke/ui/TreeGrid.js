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
org.koshinuke.ui.TreeGrid = function(loader, opt_domHelper) {
	goog.ui.Component.call(this, opt_domHelper);
	this.listenEvents_();
	this.loader = loader;
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
	return element.tagName == 'TABLE' || element.tagName == 'TBODY';
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
	var model = e.rowEl.model;
	if(model.hasChild) {
		if(model.isLoaded) {
			this.switchChildNodes_(e.rowEl, function(next, mine, yours) {
				var pl = yours.length;
				if(0 < pl && mine.length < pl) {
					goog.array.forEach(goog.dom.query('.expand', next), function(a) {
						var ary = goog.dom.classes.get(a);
						var et = org.koshinuke.ui.TreeGrid.EventType;
						this.fire_(a, et.BEFORE_COLLAPSE, et.COLLAPSE, ary[0], org.koshinuke.ui.TreeGrid.NodeState.COLLAPSE);
					}, this);
					goog.style.showElement(next, false);
					return false;
				}
				return true;
			});
		} else {
			// now loading
			e.preventDefault();
		}
	}
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
/** @private */
org.koshinuke.ui.TreeGrid.prototype.getPath_ = function(el) {
	if(el.model && el.model.path) {
		return el.model.path.split('/');
	}
	return [];
};
/** @private */
org.koshinuke.ui.TreeGrid.prototype.handleBeforeExpand_ = function(e) {
	var model = e.rowEl.model;
	if(model.hasChild) {
		if(model.isLoaded) {
			this.switchChildNodes_(e.rowEl, function(next, mine, yours) {
				var ml = mine.length;
				var yl = yours.length;
				if(ml + 1 == yl) {
					goog.style.showElement(next, true);
					return false;
				}
				return true;
			});
		} else {
			this.loader.load(model);
		}
	}
};
/** @override */
org.koshinuke.ui.TreeGrid.prototype.disposeInternal = function() {
	org.koshinuke.ui.TreeGrid.superClass_.disposeInternal.call(this);
	this.loader = null;
};