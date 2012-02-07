goog.provide('org.koshinuke.model.BlameFacade');

goog.require('goog.array');
goog.require('goog.net.XhrIo');
goog.require('goog.string');
goog.require('soy.StringBuilder');

goog.require('org.koshinuke');
goog.require('org.koshinuke.model.AbstractFacade');

/** @constructor */
org.koshinuke.model.BlameFacade = function(uri) {
	org.koshinuke.model.AbstractFacade.call(this, uri);
};
goog.inherits(org.koshinuke.model.BlameFacade, org.koshinuke.model.AbstractFacade);

org.koshinuke.model.BlameFacade.prototype.load = function(model, fn) {
	goog.net.XhrIo.send(this.toRequestUri(model.path + "/blame/" + model.node.path), function(e) {
		var raw = e.target.getResponseJson();
		var bs = [];
		var stb = new soy.StringBuilder();
		goog.array.forEach(raw, function(a) {
			stb.append(a["content"]);
			stb.append('\n');
			bs.push({
				commit: raw['commit'],
				timestamp : org.koshinuke.toDateString(raw['timestamp']),
				author : raw['author'],
				message : raw['message']
			});
		});
		fn({
			contenttype : org.koshinuke.model.ResourceFacade.extToMIME(model.node.path),
			content : stb.toString(),
			blames : bs
		});
	}, null, org.koshinuke.model.AbstractFacade.Headers);
};
