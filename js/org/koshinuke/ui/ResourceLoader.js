goog.provide('org.koshinuke.ui.ResourceLoader');

goog.require('goog.array');
goog.require('goog.json');
goog.require('goog.net.XhrIo');
goog.require('goog.Uri');

goog.require('org.koshinuke');
goog.require('org.koshinuke.ui.TreeGrid.Node');
goog.require('org.koshinuke.ui.TreeGrid.Leaf');

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
org.koshinuke.ui.ResourceLoader.prototype.makeLoadingNode = function() {
	return goog.dom.createDom("div", {
		'class' : 'loading_large'
	});
};

org.koshinuke.ui.ResourceLoader.prototype.load = function(parentNode, model) {
	// loading... element
	var loading = this.makeLoadingNode();
	goog.dom.appendChild(parentNode, loading);
};
