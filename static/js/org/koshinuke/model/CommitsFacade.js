goog.provide('org.koshinuke.model.CommitsFacade');

goog.require('goog.array');
goog.require('goog.net.XhrIo');

goog.require('org.koshinuke');
goog.require('org.koshinuke.model.AbstractFacade');

/** @constructor */
org.koshinuke.model.CommitsFacade = function(uri) {
	org.koshinuke.model.AbstractFacade.call(this, uri);
};
goog.inherits(org.koshinuke.model.CommitsFacade, org.koshinuke.model.AbstractFacade);

org.koshinuke.model.CommitsFacade.prototype.load = function(model, fn) {
	goog.net.XhrIo.send(this.toRequestUri(model.path + "/commits/" + model.branch.path), function(e) {
		var raw = e.target.getResponseJson();
		var commits = goog.array.reduce(raw, function(r, v) {
			var m = {
				commit : v['commit'],
				timestamp : org.koshinuke.toDateString(v['timestamp']),
				author : v['author'],
				message : v['message'],
				parent : v['parent']
			};
			r.push(m);
			return r;
		}, []);

		goog.array.sort(commits, function(l, r) {
			return goog.array.defaultCompare(r.timestamp, l.timestamp);
		});
		fn(commits);
	}, null, org.koshinuke.model.AbstractFacade.Headers);
};
