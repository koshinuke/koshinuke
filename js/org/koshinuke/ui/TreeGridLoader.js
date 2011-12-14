goog.provide('org.koshinuke.ui.TreeGridLoader');

goog.require('goog.array');
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

org.koshinuke.ui.TreeGridLoader.prototype.load = function(model) {
	var psuedo = new org.koshinuke.ui.TreeGrid.Psuedo(model.path);
	var parent = model.getParent();
	var index = parent.indexOfChild(model) + 1;
	parent.addChildAt(psuedo, index, true);

	var self = this;
	// TODO エラー処理, Timeout, ServerError
	goog.net.XhrIo.send(this.toRequestUri(model).toString(), function(e) {
		parent.removeChild(psuedo, true);
		var raw = goog.json.parse(e.target.getResponseText());
		var kids = [];
		goog.array.forEach(raw, function(a) {
			var m;
			var type = a['type'];
			if(type == 'tree') {
				m = new org.koshinuke.ui.TreeGrid.Node();
			} else {
				m = new org.koshinuke.ui.TreeGrid.Leaf();
				var ext = org.koshinuke.getExtension(a['path'], m.icon);
				m.icon = org.koshinuke.findIcon(ext);
			}
			m.type = type;
			m.path = a['path'];
			m.name = a['name'];
			m.timestamp = a['timestamp'];
			m.message = a['message'];
			m.author = a['author'];

			org.koshinuke.ui.TreeGridLoader.setUpForSort(m);
			kids.push(m);
		});
		goog.array.sort(kids, self.comparator);
		goog.array.forEach(kids, function(a, i) {
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
	delete model.level;
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
