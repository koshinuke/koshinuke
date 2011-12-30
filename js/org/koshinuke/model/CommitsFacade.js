goog.provide('org.koshinuke.model.CommitsFacade');

goog.require('goog.array');
goog.require('goog.net.XhrIo');
goog.require('goog.Uri');
goog.require('goog.string');

goog.require('org.koshinuke');

/** @constructor */
org.koshinuke.model.CommitsFacade = function(uri) {
	this.uri = uri;
};

org.koshinuke.model.CommitsFacade.prototype.toRequestUri = function(model) {
	// TODO for mockup
	console.log('CommitsFacade', model, model.commit);
	return this.uri.resolve(new goog.Uri('/koshinuke/stub/commits.json'));
};
org.koshinuke.model.CommitsFacade.prototype.load = function(model, fn) {
	goog.net.XhrIo.send(this.toRequestUri(model), goog.partial(this.handleResponse_, model, fn));
};
/** @private */
org.koshinuke.model.CommitsFacade.prototype.handleResponse_ = function(model, fn, e) {
	var raw = e.target.getResponseJson();
	var commits = goog.array.reduce(raw, function(r, v) {
		var m = {
			commit : v['commit'],
			timestamp : org.koshinuke.toDateString(v['timestamp']),
			author : goog.string.urlDecode(v['author']),
			message : goog.string.urlDecode(v['message']),
			parent : v['parent']
		};
		r.push(m);
		return r;
	}, []);

	goog.array.sort(commits, function(l, r) {
		return goog.array.defaultCompare(l.timestamp, r.timestamp);
	});
	fn(commits);
};
