goog.provide('org.koshinuke.ui.PaneTabRenderer');

goog.require('goog.dom');
goog.require('goog.ui.TabRenderer');

/**
 * @constructor
 * @extends {goog.ui.TabRenderer}
 */
org.koshinuke.ui.PaneTabRenderer = function() {
	goog.ui.TabRenderer.call(this);
};
goog.inherits(org.koshinuke.ui.PaneTabRenderer, goog.ui.TabRenderer);
goog.addSingletonGetter(org.koshinuke.ui.PaneTabRenderer);

/** @override */
org.koshinuke.ui.PaneTabRenderer.prototype.createDom = function(tab) {
	var element = org.koshinuke.ui.PaneTabRenderer.superClass_.createDom.call(this, tab);
	var c = goog.dom.createDom('span', {
		"class" : 'close'
	}, 'x');
	goog.dom.appendChild(element, c);
	return element;
};
