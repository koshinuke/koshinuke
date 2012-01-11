goog.provide('org.koshinuke.model.RepositoryFacade');

goog.require('goog.array');
goog.require('goog.net.XhrIo');
goog.require('goog.Uri');

goog.require('org.koshinuke.ui.Repository');

/** @constructor */
org.koshinuke.model.RepositoryFacade = function(uri) {
	this.uri = uri;
};
org.koshinuke.model.RepositoryFacade.prototype.toRequestUri = function() {
	// TODO for mockup
	//return this.uri.resolve(new goog.Uri('/koshinuke/stub/repo_list.json'));
	return this.uri.resolve(new goog.Uri("/"));
};
org.koshinuke.model.RepositoryFacade.prototype.load = function(every, fin) {
	goog.net.XhrIo.send(this.toRequestUri().toString(), function(e) {
		goog.array.forEach(e.target.getResponseJson(), function(a) {
			var r = new org.koshinuke.ui.Repository();
			r.setJson(a);
			every(r);
		});
		fin();
	}, 'GET', null, {
		"X-Requested-With": "XMLHttpRequest",
		"Cache-Control": "no-cache",
		"Pragma": "no-cache"
	});
};
