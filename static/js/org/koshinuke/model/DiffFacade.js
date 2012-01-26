goog.provide('org.koshinuke.model.DiffFacade');

goog.require('goog.array');
goog.require('goog.net.XhrIo');

goog.require('org.koshinuke');
goog.require('org.koshinuke.model.AbstractFacade');

/** @constructor */
org.koshinuke.model.DiffFacade = function(uri) {
	org.koshinuke.model.AbstractFacade.call(this, uri);
};
goog.inherits(org.koshinuke.model.DiffFacade, org.koshinuke.model.AbstractFacade);

org.koshinuke.model.DiffFacade.prototype.load = function(model, fn) {
	goog.net.XhrIo.send(this.toRequestUri(model.path + "/commit/" + model.commit.commit), function(e) {
		var raw = e.target.getResponseJson();
		var diff = {
			author : raw['author'],
			message: raw['message'],
			timestamp : org.koshinuke.toDateString(raw['timestamp']),
			commit : raw['commit'],
			parents : raw['parents'],
			diff : goog.array.reduce(raw['diff'], function(r, v) {
				var m = {
					operation : v['operation'],
					oldpath : v['oldpath'],
					newpath : v['newpath'],
					patch : v['patch'],
					content : v['content']
				};
				r.push(m);
				return r;
			}, [])
		};
		fn(diff);
	}, null, org.koshinuke.model.AbstractFacade.Headers);
};
