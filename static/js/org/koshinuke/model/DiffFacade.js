goog.provide('org.koshinuke.model.DiffFacade');

goog.require('goog.array');
goog.require('goog.net.XhrIo');
goog.require('goog.Uri');
goog.require('goog.string');

goog.require('org.koshinuke');

/** @constructor */
org.koshinuke.model.DiffFacade = function(uri) {
	this.uri = uri;
};

org.koshinuke.model.DiffFacade.prototype.toRequestUri = function(model) {
	// TODO for mockup
	console.log('DiffFacade', model, model.commit);
	//return this.uri.resolve(new goog.Uri('/koshinuke/stub/diff.json'));
	return this.uri.resolve(new goog.Uri("/dynamic/" + model.path + "/commit/" + model.commit.commit));
};
org.koshinuke.model.DiffFacade.prototype.load = function(model, fn) {
	goog.net.XhrIo.send(this.toRequestUri(model), goog.partial(this.handleResponse_, model, fn));
};
/** @private */
org.koshinuke.model.DiffFacade.prototype.handleResponse_ = function(model, fn, e) {
	var raw = e.target.getResponseJson();
	var diff = {
		commit : raw['commit'],
		parent : raw['parent'],
		diff : goog.array.reduce(raw['diff'], function(r, v) {
			var m = {
				operation : v['operation'],
				b_path : v['b_path'],
				a_path : v['a_path'],
				patch : v['patch'],
				content : v['content']
			};
			r.push(m);
			return r;
		}, [])
	};
	fn(diff);
};
