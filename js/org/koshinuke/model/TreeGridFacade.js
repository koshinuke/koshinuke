goog.provide('org.koshinuke.model.TreeGridFacade');
goog.provide('org.koshinuke.model.BranchFacade');
goog.provide('org.koshinuke.model.TagFacade');

goog.require('goog.array');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.string');
goog.require('goog.net.XhrIo');
goog.require('goog.Uri');

goog.require('org.koshinuke');
goog.require('org.koshinuke.ui.TreeGrid.Node');
goog.require('org.koshinuke.ui.TreeGrid.Leaf');
goog.require('org.koshinuke.ui.TreeGrid.Psuedo');

/** @constructor */
org.koshinuke.model.TreeGridFacade = function(uri, opt_comparator) {
	this.uri = uri;
	this.comparator = opt_comparator || org.koshinuke.model.TreeGridFacade.defaultCompare;
};
org.koshinuke.model.TreeGridFacade.prototype.toRequestUri = goog.abstractMethod;

/** @constructor */
org.koshinuke.model.BranchFacade = function(uri, opt_comparator) {
	org.koshinuke.model.TreeGridFacade.call(this, uri, opt_comparator);
};
goog.inherits(org.koshinuke.model.BranchFacade, org.koshinuke.model.TreeGridFacade);

/** @override */
org.koshinuke.model.BranchFacade.prototype.toRequestUri = function(model) {
	// TODO for mockup
	//return this.uri.resolve(new goog.Uri('/koshinuke/stub/' + model.path + '.json'));
	return this.uri.resolve(new goog.Uri("/" + model.path + "/tree/" + model.node.path));
};

/** @constructor */
org.koshinuke.model.TagFacade = function(uri, opt_comparator) {
	org.koshinuke.model.TreeGridFacade.call(this, uri, opt_comparator);
};
goog.inherits(org.koshinuke.model.TagFacade, org.koshinuke.model.TreeGridFacade);

/** @override */
org.koshinuke.model.TagFacade.prototype.toRequestUri = function(model) {
	// TODO for mockup
	//return this.uri.resolve(new goog.Uri('/koshinuke/stub/' + model.path + '.json'));
	return this.uri.resolve(new goog.Uri("/" + model.path + "/tree/" + model.node.path));
};

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
org.koshinuke.model.TreeGridFacade.prototype.load = function(model,fn) {
	var psuedo = new org.koshinuke.ui.TreeGrid.Psuedo(model.path);
	org.koshinuke.model.TreeGridFacade.setUpForSort(psuedo);
	var parent = model.node.getParent();
	var index = parent.indexOfChild(model) + 1;
	parent.addChildAt(psuedo, index, true);

	var self = this;
	// TODO エラー処理, Timeout, ServerError, エラー時のリトライ用Node？
	goog.net.XhrIo.send(this.toRequestUri(model).toString(), function(e) {
		var raw = e.target.getResponseJson();
		parent.removeChild(psuedo, true);
		var kids = [];
		goog.array.forEach(raw, function(a) {
			var m = org.koshinuke.ui.TreeGrid.Node.newFromJson(a);
			org.koshinuke.model.TreeGridFacade.setUpForSort(m);
			kids.push(m);
		});
		goog.array.sort(kids, self.comparator);
		goog.array.forEach(kids, org.koshinuke.model.TreeGridFacade.tearDownForSort);
		fn(kids);
	});
};
org.koshinuke.model.TreeGridFacade.setUpForSort = function(model) {
	var ary = model.path.split('/');
	model.ary = ary;
	model.level = ary.length - 1;
};
org.koshinuke.model.TreeGridFacade.tearDownForSort = function(model) {
	delete model.ary;
};
org.koshinuke.model.TreeGridFacade.pathElementCompare = function(l, r, i) {
	return goog.array.defaultCompare(l.ary[i], r.ary[i]);
};
org.koshinuke.model.TreeGridFacade.levelCompare = function(l, r) {
	return goog.array.defaultCompare(l.level, r.level);
};
org.koshinuke.model.TreeGridFacade.defaultCompare = function(l, r) {
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
