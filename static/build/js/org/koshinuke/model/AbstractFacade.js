goog.provide('org.koshinuke.model.AbstractFacade');

goog.require('goog.dom');
goog.require('goog.dom.forms');
goog.require('goog.net.XhrIo');
goog.require('goog.object');
goog.require('goog.Uri');

/** @constructor */
org.koshinuke.model.AbstractFacade = function(uri) {
	this.uri = uri;
};

org.koshinuke.model.AbstractFacade.Headers = {
	"Cache-Control" : "no-cache",
	"Pragma" : "no-cache",
	"X-Requested-With" : "XMLHttpRequest",
	"Accept" : "application/json"
};

org.koshinuke.model.AbstractFacade.prototype.toRequestUri = function(path) {
	return this.uri.resolve(new goog.Uri("/api/1.0/" + path));
};

org.koshinuke.model.AbstractFacade.prototype.get = function(path, pubSubKey) {
	goog.net.XhrIo.send(this.toRequestUri(path).toString(), function(e) {
		org.koshinuke.PubSub.publish(pubSubKey, e.target.getResponseJson());
	}, 'GET', null, org.koshinuke.model.AbstractFacade.Headers);
};

org.koshinuke.model.AbstractFacade.prototype.makeHeader = function() {
	var h = goog.object.clone(org.koshinuke.model.AbstractFacade.Headers);
	h["X-KoshiNuke"] = goog.dom.forms.getValue(goog.dom.getElement('ct'));
	return h;
};

org.koshinuke.model.AbstractFacade.prototype.post = function(path, pubSubKey, formEl) {
	goog.net.XhrIo.send(this.toRequestUri(path).toString(), function(e) {
		org.koshinuke.PubSub.publish(pubSubKey, e.target.getResponseJson());
	}, 'POST', goog.dom.forms.getFormDataString(formEl), this.makeHeader());
};
