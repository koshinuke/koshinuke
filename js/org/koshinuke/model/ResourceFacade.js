goog.provide('org.koshinuke.model.ResourceFacade');

goog.require('goog.array');
goog.require('goog.net.XhrIo');
goog.require('goog.string');
goog.require('goog.Uri');

goog.require('org.koshinuke');

/** @constructor */
org.koshinuke.model.ResourceFacade = function(uri) {
	this.uri = uri;
};

org.koshinuke.model.ResourceFacade.prototype.toRequestUri = function(model) {
	// TODO for mock
	console.log('ResourceFacade', model);
	//var u = this.uri.resolve(new goog.Uri('/koshinuke/stub/resource.json'));
	var u = this.uri.resolve(new goog.Uri("/" + model.path + "/blob/" + model.node.path));
	return u;
};
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
	".yml" : "text/x-yaml"
};
org.koshinuke.model.ResourceFacade.extToMIME = function(path) {
	var ext = org.koshinuke.getExtension(path, "");
	return org.koshinuke.model.ResourceFacade.ExtensionToMIME[ext.toLowerCase()];
};

org.koshinuke.model.ResourceFacade.prototype.load = function(model, fn) {
	goog.net.XhrIo.send(this.toRequestUri(model), goog.partial(this.handleResponse, model, fn));
};

org.koshinuke.model.ResourceFacade.prototype.handleResponse = function(model, fn, e) {
	// TODO error handling.
	var raw = e.target.getResponseJson();
	var resourceModel = {
		commit : raw['commit'],
		timestamp : org.koshinuke.toDateString(raw['timestamp']),
		author : goog.string.urlDecode(raw['author']),
		message : goog.string.urlDecode(raw['message']),
		contents : goog.string.urlDecode(raw['contents'])
	};
	var ct = e.target.getResponseHeader('Content-Type');
	var path = model.node.path;
	if(!ct
	// TODO Aptanaのサーバがあんまりなので回避措置
	|| ct == 'text/html') {
		var re = new RegExp('\\.(jpe?g|gif|png|ico)$', 'i');
		var match = re.exec(path);
		if(match) {
			ct = "image/" + match[1];
		} else {
			ct = org.koshinuke.model.ResourceFacade.extToMIME(path);
		}
	}
	fn(ct, resourceModel);
};

org.koshinuke.model.ResourceFacade.prototype.send = function(model, fn) {
	var sendmodel = {
		"path" : goog.string.urlEncode(model.path),
		"commit" : model.commit,
		"message" : goog.string.urlEncode(model.message),
		"contents" : goog.string.urlEncode(model.contents)
	};
	var json = goog.json.serialize(sendmodel);
	goog.net.XhrIo.send(this.toRequestUri(model), goog.partial(this.handleResponse, model, fn), "POST", json, {
		// TODO CSRFトークンを投げる。
		"X-KOSHINUKE" : true
	});
};
