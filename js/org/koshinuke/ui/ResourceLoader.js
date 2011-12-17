goog.provide('org.koshinuke.ui.ResourceLoader');

goog.require('goog.array');
goog.require('goog.net.XhrIo');
goog.require('goog.Uri');

goog.require('org.koshinuke');

/** @constructor */
org.koshinuke.ui.ResourceLoader = function(uri) {
	this.uri = uri;
};

org.koshinuke.ui.ResourceLoader.prototype.toRequestUri = function(model) {
	// TODO for mock
	var u = this.uri.resolve(new goog.Uri('/koshinuke/stub/resource'));
	u.setParameterValue('rp', model.resourcePath);
	return u;
};
/** @enum {string} */
org.koshinuke.ui.ResourceLoader.ExtensionToMIME = {
	".coffee" : "text/x-coffeescript",
	".css" : "text/css",
	".diff" : "text/x-diff",
	".js" : "text/javascript",
	".json" : "application/json",
	".md" : "text/x-markdown",
	".php" : "application/x-httpd-php-open",
	".py" : "text/x-python",
	".rst" : "text/x-rst",
	".rb" : "text/x-ruby",
	".xml" : "application/xml",
	".html" : "text/html",
	".yml" : "text/x-yaml"
};
org.koshinuke.ui.ResourceLoader.extToMIME = function(path) {
	var ext = org.koshinuke.getExtension(path, "");
	return org.koshinuke.ui.ResourceLoader.ExtensionToMIME[ext.toLowerCase()];
};

org.koshinuke.ui.ResourceLoader.prototype.load = function(model, fn) {
	goog.net.XhrIo.send(this.toRequestUri(model).toString(), function(e) {
		var txt = e.target.getResponseText();
		var ct = e.target.getResponseHeader('Content-Type');
		if(!ct || ct == 'text/plain'
		// TODO Aptanaのサーバがあんまりなので回避措置
		|| ct == 'text/html') {
			ct = org.koshinuke.ui.ResourceLoader.extToMIME(model.resourcePath);
		}
		fn(ct, txt);
	});
};
