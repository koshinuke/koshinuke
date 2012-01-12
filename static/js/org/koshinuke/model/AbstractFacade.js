goog.provide('org.koshinuke.model.AbstractFacade');

goog.require('goog.dom.forms');
goog.require('goog.net.XhrIo');
goog.require('goog.Uri');

/** @constructor */
org.koshinuke.model.AbstractFacade = function(uri) {
	this.uri = uri;
};
/** @const */
org.koshinuke.model.AbstractFacade.Headers = {
	"X-Requested-With" : "XMLHttpRequest",
	"Cache-Control" : "no-cache",
	"Pragma" : "no-cache"
};

org.koshinuke.model.AbstractFacade.prototype.toRequestUri = function(path) {
	return this.uri.resolve(new goog.Uri("/dynamic" + path));
};

org.koshinuke.model.AbstractFacade.prototype.get = function(path, pubSubKey) {
	goog.net.XhrIo.send(this.toRequestUri(path).toString(), function(e) {
		org.koshinuke.PubSub.publish(pubSubKey, e.target.getResponseJson());
	}, 'GET', null, org.koshinuke.model.AbstractFacade.Headers);
};

org.koshinuke.model.AbstractFacade.prototype.post = function(path, pubSubKey, formEl) {
	goog.net.XhrIo.send(this.toRequestUri(path).toString(), function(e) {
		org.koshinuke.PubSub.publish(pubSubKey, e.target.getResponseJson());
	}, 'POST', goog.dom.forms.getFormDataString(formEl), org.koshinuke.model.AbstractFacade.Headers);
};
