goog.provide('org.koshinuke.model.TreeGridFacade');

goog.require('goog.array');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.string');
goog.require('goog.net.XhrIo');
goog.require('goog.Uri');

goog.require('org.koshinuke');
goog.require('org.koshinuke.model.AbstractFacade');
goog.require('org.koshinuke.ui.TreeGrid.Node');
goog.require('org.koshinuke.ui.TreeGrid.Leaf');
goog.require('org.koshinuke.ui.TreeGrid.Psuedo');

/** @constructor */
org.koshinuke.model.TreeGridFacade = function(uri) {
	this.uri = uri;
};
goog.inherits(org.koshinuke.model.TreeGridFacade, org.koshinuke.model.AbstractFacade);

org.koshinuke.model.TreeGridFacade.prototype.emitLoaded = function(kids, cursor, model) {
	var kL = kids.length;
	var i = model.children;
	for(; 0 < i; i--) {
		var last = cursor + i;
		if(last < kL) {
			if(goog.string.startsWith(kids[last].path, model.path)) {
				model.isLoaded = true;
				return;
			}
		}
	}
	model.loadedOffset = i;
};
org.koshinuke.model.TreeGridFacade.prototype.load = function(model, fn) {
	var psuedo = new org.koshinuke.ui.TreeGrid.Psuedo(model.node.path);
	var parent = model.node.getParent();
	var index = parent.indexOfChild(model.node) + 1;
	parent.addChildAt(psuedo, index, true);

	var self = this;
	// TODO エラー処理, Timeout, ServerError, エラー時のリトライ用Node？
	goog.net.XhrIo.send(this.toRequestUri("/" + model.path + "/tree/" + model.node.path), function(e) {
		var raw = e.target.getResponseJson();
		parent.removeChild(psuedo, true);
		var kids = [];
		goog.array.forEach(raw, function(a) {
			var m = org.koshinuke.ui.TreeGrid.Node.newFromJson(a);
			kids.push(m);
		});
		goog.array.sort(kids, self.compare);
		goog.array.forEach(kids, function(a){
			a.tearDownForSort();
		});
		fn(kids);
	});
};

org.koshinuke.model.TreeGridFacade.pathElementCompare = function(l, r, i) {
	return goog.array.defaultCompare(l.ary[i], r.ary[i]);
};
org.koshinuke.model.TreeGridFacade.levelCompare = function(l, r) {
	return goog.array.defaultCompare(l.level, r.level);
};
org.koshinuke.model.TreeGridFacade.prototype.compare = function(l, r) {
	var minL = Math.min(l.level, r.level);
	for(var i = 0; i < minL; i++) {
		var diff = org.koshinuke.model.TreeGridFacade.pathElementCompare(l, r, i);
		if(diff) {
			return diff;
		}
	}
	if(l.type == 'tree') {
		if(l.type == r.type || l.level < r.level) {
			var diff = org.koshinuke.model.TreeGridFacade.pathElementCompare(l, r, minL);
			if(diff) {
				return diff;
			}
		}
		if(l.type == r.type) {
			return org.koshinuke.model.TreeGridFacade.levelCompare(l, r);
		}
		return -1;
	}
	if(l.type == 'blob') {
		if((l.type == r.type && r.level == l.level) || (l.type != r.type && r.level < l.level)) {
			var diff = org.koshinuke.model.TreeGridFacade.pathElementCompare(l, r, minL);
			if(diff) {
				return diff;
			}
		}
		if(l.type == r.type) {
			return org.koshinuke.model.TreeGridFacade.levelCompare(r, l);
		}
		return 1;
	}
	return 0;
};
