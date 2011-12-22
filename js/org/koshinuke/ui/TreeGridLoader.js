goog.provide('org.koshinuke.ui.TreeGridLoader');
goog.provide('org.koshinuke.ui.BranchLoader');
goog.provide('org.koshinuke.ui.TagLoader');

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
org.koshinuke.ui.TreeGridLoader = function(uri, opt_comparator) {
	this.uri = uri;
	this.comparator = opt_comparator || org.koshinuke.ui.TreeGridLoader.defaultCompare;
};
org.koshinuke.ui.TreeGridLoader.prototype.toRequestUri = goog.abstractMethod;

/** @constructor */
org.koshinuke.ui.BranchLoader = function(uri, opt_comparator) {
	org.koshinuke.ui.TreeGridLoader.call(this, uri, opt_comparator);
};
goog.inherits(org.koshinuke.ui.BranchLoader, org.koshinuke.ui.TreeGridLoader);

/** @override */
org.koshinuke.ui.BranchLoader.prototype.toRequestUri = function(model) {
	// TODO for mockup
	return this.uri.resolve(new goog.Uri('/koshinuke/stub/' + model.path + '.json'));
};

/** @constructor */
org.koshinuke.ui.TagLoader = function(uri, opt_comparator) {
	org.koshinuke.ui.TreeGridLoader.call(this, uri, opt_comparator);
};
goog.inherits(org.koshinuke.ui.TagLoader, org.koshinuke.ui.TreeGridLoader);

/** @override */
org.koshinuke.ui.TagLoader.prototype.toRequestUri = function(model) {
	// TODO for mockup
	return this.uri.resolve(new goog.Uri('/koshinuke/stub/' + model.path + '.json'));
};

org.koshinuke.ui.TreeGridLoader.prototype.emitLoaded = function(kids, cursor, model) {
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
org.koshinuke.ui.TreeGridLoader.prototype.load = function(model) {
	var psuedo = new org.koshinuke.ui.TreeGrid.Psuedo(model.path);
	org.koshinuke.ui.TreeGridLoader.setUpForSort(psuedo);
	var parent = model.getParent();
	var index = parent.indexOfChild(model) + 1;
	parent.addChildAt(psuedo, index, true);

	var self = this;
	// TODO エラー処理, Timeout, ServerError, エラー時のリトライ用Node？
	goog.net.XhrIo.send(this.toRequestUri(model).toString(), function(e) {
		var raw = e.target.getResponseJson();
		parent.removeChild(psuedo, true);
		var kids = [];
		goog.array.forEach(raw, function(a) {
			var m = org.koshinuke.ui.TreeGrid.newFromJson(a);
			org.koshinuke.ui.TreeGridLoader.setUpForSort(m);
			kids.push(m);
		});
		goog.array.sort(kids, self.comparator);
		goog.array.forEach(kids, function(a, i) {
			// TODO 子要素のうち最新のtimestamp,message, authorを拾って設定する
			self.emitLoaded(kids, i, a);
			org.koshinuke.ui.TreeGridLoader.tearDownForSort(a);
			parent.addChildAt(a, index + i, true);
		});
		model.isLoaded = true;
		parent.dispatchEvent({
			type : org.koshinuke.ui.TreeGrid.EventType.BEFORE_EXPAND,
			rowEl : model.getElement()
		});
	});
};
org.koshinuke.ui.TreeGridLoader.setUpForSort = function(model) {
	var ary = model.path.split('/');
	model.ary = ary;
	model.level = ary.length - 1;
};
org.koshinuke.ui.TreeGridLoader.tearDownForSort = function(model) {
	delete model.ary;
};
org.koshinuke.ui.TreeGridLoader.pathElementCompare = function(l, r, i) {
	return goog.array.defaultCompare(l.ary[i], r.ary[i]);
};
org.koshinuke.ui.TreeGridLoader.levelCompare = function(l, r) {
	return goog.array.defaultCompare(l.level, r.level);
};
org.koshinuke.ui.TreeGridLoader.defaultCompare = function(l, r) {
	var minL = Math.min(l.level, r.level);
	for(var i = 0; i < minL; i++) {
		var diff = org.koshinuke.ui.TreeGridLoader.pathElementCompare(l, r, i);
		if(diff) {
			return diff;
		}
	}
	if(l.type == 'tree') {
		if(l.type == r.type || l.level < r.level) {
			var diff = org.koshinuke.ui.TreeGridLoader.pathElementCompare(l, r, minL);
			if(diff) {
				return diff;
			}
		}
		if(l.type == r.type) {
			return org.koshinuke.ui.TreeGridLoader.levelCompare(l, r);
		}
		return -1;
	}
	if(l.type == 'blob') {
		if((l.type == r.type && r.level == l.level) || (l.type != r.type && r.level < l.level)) {
			var diff = org.koshinuke.ui.TreeGridLoader.pathElementCompare(l, r, minL);
			if(diff) {
				return diff;
			}
		}
		if(l.type == r.type) {
			return org.koshinuke.ui.TreeGridLoader.levelCompare(r, l);
		}
		return 1;
	}
	return 0;
};
