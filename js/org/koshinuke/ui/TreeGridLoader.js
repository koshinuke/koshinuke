goog.provide('org.koshinuke.ui.TreeGridLoader');

goog.require('goog.array');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.net.XhrIo');

goog.require('org.koshinuke');
goog.require('org.koshinuke.ui.TreeGrid.Node');
goog.require('org.koshinuke.ui.TreeGrid.Leaf');
goog.require('org.koshinuke.ui.TreeGrid.Psuedo');

/** @constructor */
org.koshinuke.ui.TreeGridLoader = function(uri, opt_comparator) {
	this.uri = uri;
	this.comparator = opt_comparator || org.koshinuke.ui.TreeGridLoader.defaultCompare;
};

org.koshinuke.ui.TreeGridLoader.prototype.toRequestUri = function(model) {
	// TODO for mockup
	return this.uri.resolve(new goog.Uri('/koshinuke/stub/' + model.path + '.json'));
};

org.koshinuke.ui.TreeGridLoader.prototype.jsonToModel = function(json) {
	var m;
	var type = json['type'];
	if(type == 'tree') {
		m = new org.koshinuke.ui.TreeGrid.Node();
	} else {
		m = new org.koshinuke.ui.TreeGrid.Leaf();
		var ext = org.koshinuke.getExtension(json['path'], m.icon);
		m.icon = org.koshinuke.findIcon(ext);
	}
	m.type = type;
	m.path = goog.string.urlDecode(json['path']);
	m.name = goog.string.urlDecode(json['name']);
	m.timestamp = new goog.i18n.DateTimeFormat('yyyy-MM-dd HH:mm:ss').format(new Date(json['timestamp']));
	m.message = goog.string.urlDecode(json['message']);
	m.author = goog.string.urlDecode(json['author']);
	var c = json['children'];
	if(c) {
		m.children = c;
	}
	return m;
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
		var raw = goog.json.parse(e.target.getResponseText());
		parent.removeChild(psuedo, true);
		var kids = [];
		goog.array.forEach(raw, function(a) {
			var m = self.jsonToModel(a);
			org.koshinuke.ui.TreeGridLoader.setUpForSort(m);
			m.visible = (model.level + 1) == m.level;
			kids.push(m);
		});
		goog.array.sort(kids, self.comparator);
		goog.array.forEach(kids, function(a, i) {
			if(0 < a.children) {
				var last = i + a.children;
				a.isLoaded = last < kids.length && goog.string.startsWith(kids[last].path, a.path);
			}
			org.koshinuke.ui.TreeGridLoader.tearDownForSort(a);
			parent.addChildAt(a, index + i, true);
		});

		model.isLoaded = true;
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
