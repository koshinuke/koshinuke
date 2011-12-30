goog.provide('org.koshinuke.ui.Commits');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');

goog.require('goog.ui.Component');

/** @constructor */
org.koshinuke.ui.Commits = function(loader, opt_domHelper) {
	goog.ui.Component.call(this, opt_domHelper);
	this.loader = loader;
};
goog.inherits(org.koshinuke.ui.Commits, goog.ui.Component);

/** @override */
org.koshinuke.ui.Commits.prototype.createDom = function() {
	this.loading = goog.dom.createDom("div", {
		'class' : 'loading_large'
	});
	var element = goog.dom.createDom("div", null, this.loading);
	this.decorateInternal(element);
};

/** @override */
org.koshinuke.ui.Commits.prototype.enterDocument = function() {
	org.koshinuke.ui.Commits.superClass_.enterDocument.call(this);
	// TODO
};

/** @override */
org.koshinuke.ui.Commits.prototype.exitDocument = function() {
	org.koshinuke.ui.Commits.superClass_.exitDocument.call(this);
	// TODO
};

org.koshinuke.ui.Commits.prototype.setVisible = function(state) {
	var el = this.getElement();
	if(el) {
		goog.style.showElement(el, state);
	}
};

/** @override */
org.koshinuke.ui.Commits.prototype.disposeInternal = function() {
	org.koshinuke.ui.Commits.superClass_.disposeInternal.call(this);
	this.loader = null;
};