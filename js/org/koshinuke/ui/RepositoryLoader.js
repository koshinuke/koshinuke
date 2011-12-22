goog.provide('org.koshinuke.ui.RepositoryLoader');

goog.require('goog.array');
goog.require('goog.net.XhrIo');
goog.require('goog.Uri');

goog.require('org.koshinuke.ui.Repository');

/** @constructor */
org.koshinuke.ui.RepositoryLoader = function(uri) {
	this.uri = uri;
};
org.koshinuke.ui.RepositoryLoader.prototype.toRequestUri = function() {
	// TODO for mockup
	return this.uri.resolve(new goog.Uri('/koshinuke/stub/repo_list.json'));
};
org.koshinuke.ui.RepositoryLoader.prototype.load = function(every, fin) {
	goog.net.XhrIo.send(this.toRequestUri().toString(), function(e) {
		goog.array.forEach(e.target.getResponseJson(), function(a) {
			var r = new org.koshinuke.ui.Repository();
			r.setJson(a);
			every(r);
		});
		fin();
	});
};
