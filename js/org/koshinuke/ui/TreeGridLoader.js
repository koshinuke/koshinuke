goog.provide('org.koshinuke.ui.TreeGridLoader');

goog.require('goog.array');
goog.require('goog.net.XhrIo');

goog.require('org.koshinuke');
goog.require('org.koshinuke.ui.TreeGrid.Node');
goog.require('org.koshinuke.ui.TreeGrid.Leaf');
goog.require('org.koshinuke.ui.TreeGrid.Psuedo');

/** @constructor */
org.koshinuke.ui.TreeGridLoader = function(uri) {
	this.uri = uri;
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

	goog.net.XhrIo.send(this.toRequestUri(model).toString(), function(e) {
		parent.removeChild(psuedo, true);
		var data = goog.json.parse(e.target.getResponseText());
		var ary = [];
		goog.array.forEach(data, function(a) {
			var m;
			var type = a['type'].toLowerCase();
			if(type.toLowerCase() == 'tree') {
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
			ary.push(m);
		});
		// TODO ソート
		goog.array.sort(ary, function(l, r) {
			return goog.array.defaultCompare(l.path, r.path);
		});
		goog.array.forEach(ary, function(a, i) {
			parent.addChildAt(a, index + i, true);
		});

		model.isLoaded = true;
	});
};
