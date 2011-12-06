goog.provide('org.koshinuke.ui.RepoTabRenderer');

goog.require('goog.dom');
goog.require('goog.ui.TabRenderer');

/**
 * @constructor
 * @extends {goog.ui.TabRenderer}
 */
org.koshinuke.ui.RepoTabRenderer = function() {
	goog.ui.TabRenderer.call(this);
};
goog.inherits(org.koshinuke.ui.RepoTabRenderer, goog.ui.TabRenderer);
goog.addSingletonGetter(org.koshinuke.ui.RepoTabRenderer);

/** @override */
org.koshinuke.ui.RepoTabRenderer.prototype.createDom = function(tab) {
	var element = org.koshinuke.ui.RepoTabRenderer.superClass_.createDom.call(this, tab);
	var c = goog.dom.createDom('span', {
		"class" : 'close'
	}, 'x');
	goog.dom.appendChild(element, c);
	return element;
};
