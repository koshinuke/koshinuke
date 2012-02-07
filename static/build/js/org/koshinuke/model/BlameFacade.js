goog.provide('org.koshinuke.model.BlameFacade');

goog.require('goog.array');
goog.require('goog.net.XhrIo');
goog.require('goog.string');

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
		
	}, null, org.koshinuke.model.AbstractFacade.Headers);
};
