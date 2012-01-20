goog.provide('org.koshinuke.model.ResourceFacade');

goog.require('goog.array');
goog.require('goog.net.XhrIo');
goog.require('goog.string');
goog.require('goog.Uri');

goog.require('org.koshinuke');
goog.require('org.koshinuke.model.AbstractFacade');

/** @constructor */
org.koshinuke.model.ResourceFacade = function(uri) {
	org.koshinuke.model.AbstractFacade.call(this, uri);
};
goog.inherits(org.koshinuke.model.ResourceFacade, org.koshinuke.model.AbstractFacade);

/** @enum {string} */
org.koshinuke.model.ResourceFacade.ExtensionToMIME = {
	".coffee" : "text/x-coffeescript",
	".css" : "text/css",
	".diff" : "text/x-diff",
	".js" : "text/javascript",
	".json" : "application/json",
	".less" : "text/less",
	".md" : "text/x-markdown",
	".php" : "application/x-httpd-php-open",
	".py" : "text/x-python",
	".rst" : "text/x-rst",
	".rb" : "text/x-ruby",
	".xml" : "application/xml",
	".html" : "text/html",
	".yml" : "text/x-yaml",
	".jpg" : "image/jpeg",
	".gif" : "image/gif",
	".png" : "image/png",
	".ico" : "image/ico"
};
org.koshinuke.model.ResourceFacade.extToMIME = function(path) {
	var ext = org.koshinuke.getExtension(path, "");
	return org.koshinuke.model.ResourceFacade.ExtensionToMIME[ext.toLowerCase()];
};

org.koshinuke.model.ResourceFacade.prototype.relativePath = function(model) {
	return "/" + model.path + "/blob/" + model.node.path;
};

org.koshinuke.model.ResourceFacade.prototype.load = function(model, fn) {
	goog.net.XhrIo.send(this.toRequestUri(this.relativePath(model)), goog.partial(this.handleResponse, model, fn), null, org.koshinuke.model.AbstractFacade.Headers);
};

org.koshinuke.model.ResourceFacade.prototype.handleResponse = function(model, fn, e) {
	// TODO error handling.
	var raw = e.target.getResponseJson();
	var resourceModel = {
		commit : raw['commit'],
		timestamp : org.koshinuke.toDateString(raw['timestamp']),
		author : raw['author'],
		message : raw['message'],
		contents : raw['contents']
	};
	var ct = org.koshinuke.model.ResourceFacade.extToMIME(model.node.path);
	fn(ct, resourceModel);
};

org.koshinuke.model.ResourceFacade.prototype.send = function(model, fn) {
	var sendmodel = {
		"path" : model.path,
		"commit" : model.commit,
		"message" : model.message,
		"contents" : model.contents
	};
	var h = goog.object.clone(org.koshinuke.model.AbstractFacade.Headers);
	h["X-KoshiNuke"] = goog.dom.forms.getValue(goog.dom.getElement('ct'));
	var json = goog.json.serialize(sendmodel);
	goog.net.XhrIo.send(this.toRequestUri(this.relativePath(model)), goog.partial(this.handleResponse, model, fn), "POST", json, h);
};
