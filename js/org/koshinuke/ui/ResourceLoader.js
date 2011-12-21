goog.provide('org.koshinuke.ui.ResourceLoader');

goog.require('goog.array');
goog.require('goog.net.XhrIo');
goog.require('goog.string');
goog.require('goog.Uri');

goog.require('org.koshinuke');

/** @constructor */
org.koshinuke.ui.ResourceLoader = function(uri) {
	this.uri = uri;
};

org.koshinuke.ui.ResourceLoader.prototype.toRequestUri = function(model) {
	// TODO for mock
	var u = this.uri.resolve(new goog.Uri('/koshinuke/stub/resource.json'));
	u.setParameterValue('rp', model.node.path);
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
		var raw = goog.json.parse(e.target.getResponseText());
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
				ct = org.koshinuke.ui.ResourceLoader.extToMIME(path);
			}
		}
		fn(ct, resourceModel);
	});
};
