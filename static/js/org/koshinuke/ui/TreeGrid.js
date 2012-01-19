goog.provide('org.koshinuke.ui.TreeGrid');
goog.provide('org.koshinuke.ui.TreeGrid.EventType');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events.Event');
goog.require('goog.object');
goog.require('goog.soy');
goog.require('goog.style');

goog.require('goog.ui.Component');

goog.require('org.koshinuke');
goog.require('org.koshinuke.template.treegrid');

/** @constructor */
org.koshinuke.ui.TreeGrid = function(facade, opt_domHelper) {
	goog.ui.Component.call(this, opt_domHelper);
	this.listenEvents_();
	this.facade = facade;
};
goog.inherits(org.koshinuke.ui.TreeGrid, goog.ui.Component);

/** @enum {string} */
org.koshinuke.ui.TreeGrid.EventType = {
	BEFORE_EXPAND : 'before' + goog.ui.Component.EventType.OPEN,
	EXPAND : goog.ui.Component.EventType.OPEN,
	BEFORE_COLLAPSE : 'before' + goog.ui.Component.EventType.CLOSE,
	COLLAPSE : goog.ui.Component.EventType.CLOSE,
	PATH_CLICK : "p.c",
	MESSAGE_CLICK : "m.c",
	AUTHOR_CLICK : "a.c"
};
/** @override */
org.koshinuke.ui.TreeGrid.prototype.createDom = function() {
	var element = goog.soy.renderAsElement(org.koshinuke.template.treegrid.table, this);
	this.decorateInternal(element);
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
			var ns = org.koshinuke.ui.TreeGrid.Node.State;
			if(goog.array.contains(ary, ns.EXPAND)) {
				this.fire_(e.target, et.BEFORE_COLLAPSE, et.COLLAPSE, ary[0], ns.COLLAPSE)
			} else if(goog.array.contains(ary, ns.COLLAPSE)) {
				this.fire_(e.target, et.BEFORE_EXPAND, et.EXPAND, ary[0], ns.EXPAND)
			} else if(goog.array.contains(ary, "path")) {
				this.fireClick_(e, et.PATH_CLICK);
			} else if(goog.array.contains(ary, "comment")) {
				this.fireClick_(e, et.MESSAGE_CLICK);
			} else if(goog.array.contains(ary, "user")) {
				this.fireClick_(e, et.AUTHOR_CLICK);
			}
		}
	}, false, this);
};
/** @private */
org.koshinuke.ui.TreeGrid.prototype.fireClick_ = function(e, type) {
	e.preventDefault();
	e.type = type;
	this.dispatchEvent(e);
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
	h.listen(this, org.koshinuke.ui.TreeGrid.EventType.PATH_CLICK, this.handlePathClick);
	h.listen(this, org.koshinuke.ui.TreeGrid.EventType.MESSAGE_CLICK, this.handleMessageClick);
	h.listen(this, org.koshinuke.ui.TreeGrid.EventType.AUTHOR_CLICK, this.handleAuthorClick);
};
org.koshinuke.ui.TreeGrid.prototype.handlePathClick = function(e) {
	var rm = org.koshinuke.findParent(e.target, 'TR').model;
	if(rm.type == 'blob') {
		var m = goog.object.clone(this.getModel());
		m.label = goog.array.flatten(m.label, rm.path.split('/'));
		m.context = org.koshinuke.ui.PaneTab.Factory.Resource;
		m.node = rm;
		org.koshinuke.PubSub.publish(org.koshinuke.PubSub.RESOURCE_SELECT, m);
	}
};
org.koshinuke.ui.TreeGrid.prototype.handleMessageClick = function(e) {
	// TODO 省略したメッセージをポップアップする？
	console.log(e, e.target);
};
org.koshinuke.ui.TreeGrid.prototype.handleAuthorClick = function(e) {
	// TODO 特定ユーザの情報をポップアップする？
	console.log(e, e.target);
};
/** @private */
org.koshinuke.ui.TreeGrid.prototype.handleBeforeCollapse_ = function(e) {
	var model = e.rowEl.model;
	if(model.hasChild) {
		if(model.isLoaded) {
			this.switchChildNodes_(e.rowEl, function(next) {
				if(0 < next.level && model.level < next.level) {
					goog.array.forEach(goog.dom.query('.expand', next.getElement()), function(a) {
						var ary = goog.dom.classes.get(a);
						var et = org.koshinuke.ui.TreeGrid.EventType;
						this.fire_(a, et.BEFORE_COLLAPSE, et.COLLAPSE, ary[0], org.koshinuke.ui.TreeGrid.Node.State.COLLAPSE);
					}, this);
					next.setVisible(false);
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
	var next;
	do {
		next = goog.dom.getNextElementSibling(re);
		if(next) {
			if(fn.call(this, next.model)) {
				break;
			}
			re = next;
		}
	} while(next);
	return true;
};
/** @private */
org.koshinuke.ui.TreeGrid.prototype.handleBeforeExpand_ = function(e) {
	var model = e.rowEl.model;
	var self = this;
	if(model.hasChild) {
		if(model.isLoaded) {
			this.switchChildNodes_(e.rowEl, function(next) {
				if(model.level + 1 == next.level) {
					next.setVisible(true);
					return false;
				}
				if(model.level + 1 < next.level) {
					return false;
				}
				return true;
			});
		} else {
			var index = self.indexOfChild(model) + 1;
			var m = goog.object.clone(this.getModel());
			m.node = e.rowEl.model;
			this.facade.load(m, function(kids) {
				goog.array.forEach(kids, function(a, i) {
					self.facade.emitLoaded(kids, i, a);
					self.addChildAt(a, index + i, true);
				});
				var next = 0;
				var kids = self.getChildCount();
				self.forEachChild(function(child) {
					next++;
					var need = false;
					if(child.type == 'tree' || child.type == 'branch' || child.type == 'tag') {
						for(var i = next; i < kids; i++) {
							var node = self.getChildAt(i);
							if(goog.string.startsWith(node.path, child.path) == false) {
								break;
							}
							if(child.rowtimestamp < node.rowtimestamp) {
								need = true;
								child.rowtimestamp = node.rowtimestamp;
								child.timestamp = node.timestamp;
								child.message = node.message;
								child.author = node.author;
							}
						}
					}
					if(need) {
						child.updateElement();
					}
				});
				model.isLoaded = true;
				self.dispatchEvent({
					type : org.koshinuke.ui.TreeGrid.EventType.BEFORE_EXPAND,
					rowEl : model.getElement()
				});
			});
		}
	}
};
org.koshinuke.ui.TreeGrid.prototype.setVisible = function(state) {
	var el = this.getElement();
	if(el) {
		goog.style.showElement(el, state);
	}
};
/** @override */
org.koshinuke.ui.TreeGrid.prototype.disposeInternal = function() {
	org.koshinuke.ui.TreeGrid.superClass_.disposeInternal.call(this);
	this.facade = null;
};
